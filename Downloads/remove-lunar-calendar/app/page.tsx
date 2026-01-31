'use client';

import { AccordionContent } from "@/components/ui/accordion"

import { AccordionTrigger } from "@/components/ui/accordion"

import { AccordionItem } from "@/components/ui/accordion"

import { Accordion } from "@/components/ui/accordion"

import Link from "next/link"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { calculateMaiHua } from '@/lib/utils/maihua-engine';
import { CHI_NAMES } from '@/lib/utils/lunar-calendar';
import { performDiagnosis, type DiagnosticResult } from '@/lib/utils/diagnostic-engine';
import type { MaiHuaResult } from '@/lib/utils/maihua-engine';
import Header from '@/components/Header';
import LoginModal from '@/components/LoginModal';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle, Loader2, BookOpen, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Use fixed initial values to avoid hydration mismatch
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2026);
  const [hour, setHour] = useState(12);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Auth and rate limit state
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [queriesRemaining, setQueriesRemaining] = useState<number | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Set actual date after hydration
  useEffect(() => {
    const now = new Date();
    setDay(now.getDate());
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setHour(now.getHours());
    setIsHydrated(true);
  }, []);

  // Check auth and rate limit on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuthAndRateLimit = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!isMounted) return;
        
        setUser(currentUser);
        
        if (currentUser) {
          // Check rate limit via RPC function
          const { data: canQuery, error } = await supabase.rpc('can_user_query', {
            p_user_id: currentUser.id
          });
          
          if (!isMounted) return;
          
          if (!error && canQuery !== null) {
            // canQuery returns true if user can still query
            // Get remaining count
            const { data: countData } = await supabase.rpc('get_user_query_count_today', {
              p_user_id: currentUser.id
            });
            if (!isMounted) return;
            const count = countData || 0;
            setQueriesRemaining(3 - count);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        // Only log non-abort errors
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Auth check error:', err);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };
    
    checkAuthAndRateLimit();
    
    return () => {
      isMounted = false;
    };
  }, [supabase]);
  
  const [result, setResult] = useState<MaiHuaResult | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  
  // Thông tin người bệnh
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [subject, setSubject] = useState<string>('banthan');
  const [question, setQuestion] = useState<string>('');
  
  const [patientContext, setPatientContext] = useState<{
    age: number;
    gender: string;
    subject: string;
    question: string;
} | null>(null);
  
  const handleCalculate = async () => {
    setRateLimitError(null);
    
    // Check if user is logged in - show modal instead of redirect
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Check rate limit
    if (queriesRemaining !== null && queriesRemaining <= 0) {
      setRateLimitError('Bạn đã sử dụng hết 3 lượt hỏi quẻ trong ngày. Vui lòng quay lại vào ngày mai.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const calculatedResult = calculateMaiHua(day, month, year, hour);
      setResult(calculatedResult);
      
      const diagnosticResult = performDiagnosis(calculatedResult);
      setDiagnostic(diagnosticResult);
      
      const context = {
        age: age ? Number.parseInt(age, 10) : 0,
        gender: gender === 'nam' ? 'Nam' : 'Nữ',
        subject,
        question: question.trim() || 'Chẩn đoán tổng quát về sức khỏe',
      };
      
      setPatientContext(context);
      
      // Save query to database for history and rate limiting
      const { error: insertError } = await supabase.from('query_history').insert({
        user_id: user.id,
        query_date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
        query_time: new Date().toISOString(),
        main_hexagram: calculatedResult.mainHexagram.name,
        changed_hexagram: calculatedResult.changedHexagram.name,
        mutual_hexagram: calculatedResult.mutualHexagram.name,
        moving_line: calculatedResult.movingLine,
        patient_age: context.age || null,
        patient_gender: context.gender,
        patient_subject: context.subject,
        question: context.question,
        input_data: {
          day, month, year, hour,
          lunarDate: calculatedResult.lunarDate
        }
      });
      
      if (insertError) {
        console.error('Error saving query:', insertError);
        // Continue anyway - don't block user
      } else {
        // Update remaining queries
        if (queriesRemaining !== null) {
          setQueriesRemaining(queriesRemaining - 1);
        }
      }
      
      // Lưu vào sessionStorage và chuyển trang
      sessionStorage.setItem('diagnostic-results', JSON.stringify({
        maihua: calculatedResult,
        diagnostic: diagnosticResult,
        patientContext: context
      }));
      
      // Chuyển đến trang kết quả
      router.push('/results');
    } catch (err) {
      console.error('Calculate error:', err);
      setRateLimitError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHexagramLines = (lines: boolean[]) => {
    return (
      <div className="flex flex-col gap-1.5">
        {[...lines].reverse().map((isYang, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12">Hào {6 - idx}</span>
            <div className="flex gap-1">
              {isYang ? (
                <div className="h-2 w-16 bg-primary rounded" />
              ) : (
                <>
                  <div className="h-2 w-7 bg-primary rounded" />
                  <div className="h-2 w-7 bg-primary rounded" />
                </>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {isYang ? 'Dương —' : 'Âm - -'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header title="Mai Hoa Tâm Pháp" subtitle="梅花心法" />

      {/* Login Modal */}
      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
        onLoginSuccess={async () => {
          // Refresh auth state after login
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          setUser(currentUser);
          if (currentUser) {
            const { data: countData } = await supabase.rpc('get_user_query_count_today', {
              p_user_id: currentUser.id
            });
            const count = countData || 0;
            setQueriesRemaining(3 - count);
          }
        }}
      />

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-background.jpg"
            alt="Hình nền y học cổ truyền"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/5 text-primary">
              Dịch học cổ truyền kết hợp công nghệ ngôn ngữ lớn
            </Badge>
            <h2 className="mb-4 text-balance text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
              Khám phá sức khỏe qua <span className="text-primary">Mai Hoa Thần Số</span>
            </h2>
            <p className="mb-6 text-pretty text-base text-muted-foreground md:text-lg">
              Lập quẻ Tiên thiên theo phương pháp Thiệu Khang Tiết, phân tích sức khỏe dựa trên Bát Quái và Ngũ Hành
            </p>
            <Button size="lg" onClick={() => document.getElementById('lap-que')?.scrollIntoView({ behavior: 'smooth' })}>
              Lập quẻ ngay
            </Button>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="lap-que" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">Lập quẻ chẩn đoán</h2>
            <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
              Nhập thông tin thời gian và người bệnh để bắt đầu chẩn đoán theo Mai Hoa Dịch Số
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            {/* Methodology Banner */}
            <div className="mb-6 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-amber-500/10 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">Tìm hiểu phương pháp trước khi gieo quẻ</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Niềm tin và sự hiểu biết là nền tảng quan trọng để quẻ có tính linh nghiệm. 
                      Hãy dành vài phút đọc về cơ sở khoa học của phương pháp này.
                    </p>
                  </div>
                </div>
                <Link href="/methodology">
                  <Button variant="outline" className="shrink-0 gap-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10">
                    Xem phương pháp
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Thông tin lập quẻ</CardTitle>
                <CardDescription>
                  Nhập đầy đủ thông tin để nhận được kết quả chẩn đoán chính xác
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Thời gian */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Thời gian (Dương lịch)</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-foreground">Ngày</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={day}
                        onChange={(e) => setDay(Number(e.target.value))}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-foreground">Tháng</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-foreground">Năm</label>
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-foreground">Giờ</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={hour}
                        onChange={(e) => setHour(Number(e.target.value))}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        placeholder="VD: 22"
                      />
                    </div>
                  </div>
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                    <p className="mb-1 text-xs font-medium text-foreground">
                      Giờ địa chi: <span className="text-primary">{CHI_NAMES[Math.floor((hour + 1) / 2) % 12]}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Nhập giờ theo định dạng 24h (0-23). VD: 22:20 → nhập 22 (Giờ Hợi: 21h-23h)
                    </p>
                  </div>
                </div>

                {/* Thông tin người bệnh */}
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-sm font-semibold text-foreground">Thông tin người bệnh</h3>
                  
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-foreground">Tuổi</label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Nhập tuổi"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-foreground">Giới tính</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'nam' | 'nu')}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      >
                        <option value="nam">Nam</option>
                        <option value="nu">Nữ</option>
                      </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="mb-1.5 block text-xs font-medium text-foreground">Đối tượng</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      >
                        <option value="banthan">Bản thân</option>
                        <option value="cha">Cha</option>
                        <option value="me">Mẹ</option>
                        <option value="con">Con</option>
                        <option value="vo">Vợ</option>
                        <option value="chong">Chồng</option>
                        <option value="anh-chi-em">Anh chị em</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">
                      Câu hỏi / Mục đích <span className="text-muted-foreground">(Tùy chọn)</span>
                    </label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ví dụ: Tình trạng sức khỏe hiện tại của tôi như thế nào?"
                      rows={2}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                </div>

                {/* Hướng dẫn gieo quẻ */}
                <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/5 to-amber-500/5 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-lg">🧘</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground">Lưu ý khi gieo quẻ</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        <strong className="text-foreground">Tâm tĩnh, ý chuyên</strong> - Chỉ gieo quẻ vào đúng thời khắc <em className="text-primary font-medium">động tâm</em>, 
                        khi tâm trí thực sự có câu hỏi cần giải đáp. Không gieo quẻ bừa bãi hoặc thử nghiệm, 
                        điều này sẽ làm mất tính linh nghiệm của quẻ.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rate Limit Status */}
                {!isCheckingAuth && (
                  <div className="space-y-3">
                    {user && queriesRemaining !== null && (
                      <div className="flex items-center justify-between rounded-md border border-border/50 bg-muted/30 px-4 py-2">
                        <span className="text-sm text-muted-foreground">Số lượt hỏi còn lại hôm nay:</span>
                        <Badge variant={queriesRemaining > 0 ? "secondary" : "destructive"}>
                          {queriesRemaining}/3
                        </Badge>
                      </div>
                    )}
                    
                    {rateLimitError && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{rateLimitError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleCalculate} 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting || (user && queriesRemaining !== null && queriesRemaining <= 0)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : !user ? 'Đăng nhập để lập quẻ' : 'Lập quẻ chẩn đoán'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {result && patientContext && (
        <section id="results" className="bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="text-2xl font-bold text-foreground">Kết quả chẩn đoán</h2>
              <div className="rounded-lg border border-border/50 bg-background p-3 text-sm">
                <p className="font-semibold text-foreground">Thông tin ngữ cảnh:</p>
                <p className="text-muted-foreground">
                  {patientContext.gender}{patientContext.age ? `, ${patientContext.age} tuổi` : ''} - {
                    patientContext.subject === 'banthan' ? 'Bản thân' :
                    patientContext.subject === 'cha' ? 'Cha' :
                    patientContext.subject === 'me' ? 'Mẹ' :
                    patientContext.subject === 'con' ? 'Con' :
                    patientContext.subject === 'vo' ? 'Vợ' :
                    patientContext.subject === 'chong' ? 'Chồng' : 'Anh chị em'
                  }
                </p>
                {patientContext.question && (
                  <p className="mt-1 italic text-muted-foreground">"{patientContext.question}"</p>
                )}
              </div>
            </div>

            {/* Hexagrams Display */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">☰☰☰</span>
                    <CardTitle className="text-foreground">Quẻ Chủ</CardTitle>
                  </div>
                  <CardDescription className="font-semibold text-foreground">
                    {result.mainHexagram.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderHexagramLines(result.mainHexagram.lines)}
                  <p className="mt-3 text-sm text-muted-foreground">
                    {result.mainHexagram.description}
                  </p>
                  <Badge variant="secondary" className="mt-3">
                    Hào động: {result.movingLine}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">☷☷☷</span>
                    <CardTitle className="text-foreground">Quẻ Biến</CardTitle>
                  </div>
                  <CardDescription className="font-semibold text-primary">
                    {result.changedHexagram.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderHexagramLines(result.changedHexagram.lines)}
                  <p className="mt-3 text-sm text-muted-foreground">
                    {result.changedHexagram.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">☶☶☶</span>
                    <CardTitle className="text-foreground">Quẻ Hổ</CardTitle>
                  </div>
                  <CardDescription className="font-semibold text-secondary">
                    {result.mutualHexagram.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderHexagramLines(result.mutualHexagram.lines)}
                  <p className="mt-3 text-sm text-muted-foreground">
                    {result.mutualHexagram.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Diagnostic Results */}
            {diagnostic && (
              <div className="space-y-6">
                {/* Mapping */}
                <Card className="border-border/50 bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Ma trận Ánh xạ Chẩn đoán</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <h4 className="mb-2 font-semibold text-foreground">
                          {diagnostic.mapping.upperTrigram.symbol} {diagnostic.mapping.upperTrigram.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>Cơ quan:</strong> {diagnostic.mapping.upperTrigram.primaryOrgans.join(', ')}
                        </p>
                      </div>
                      <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-4">
                        <h4 className="mb-2 font-semibold text-foreground">
                          {diagnostic.mapping.lowerTrigram.symbol} {diagnostic.mapping.lowerTrigram.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>Cơ quan:</strong> {diagnostic.mapping.lowerTrigram.primaryOrgans.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                      <h4 className="mb-2 font-semibold text-foreground">
                        Hào {diagnostic.mapping.movingYao.position} - {diagnostic.mapping.movingYao.bodyLevel}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {diagnostic.mapping.movingYao.clinicalSignificance}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Expert Analysis */}
                <Card className="border-border/50 bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Phân tích Chuyên gia</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className={`rounded-lg border p-4 ${
                      diagnostic.expertAnalysis.tiDung.severity === 'nặng' 
                        ? 'border-red-500/30 bg-red-500/10' 
                        : 'border-green-500/30 bg-green-500/10'
                    }`}>
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">Quan hệ Thể - Dụng</h4>
                        <Badge variant={diagnostic.expertAnalysis.tiDung.severity === 'nặng' ? 'destructive' : 'default'}>
                          {diagnostic.expertAnalysis.tiDung.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {diagnostic.expertAnalysis.tiDung.prognosis}
                      </p>
                    </div>

                    {diagnostic.expertAnalysis.diseaseFlags.needsAttention.length > 0 && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                        <h4 className="mb-2 font-semibold text-foreground">Lưu ý</h4>
                        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                          {diagnostic.expertAnalysis.diseaseFlags.needsAttention.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Giới thiệu Section */}
      <section id="gioi-thieu" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">Về Mai Hoa Tâm Pháp</h2>
            <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
              Kết hợp tinh hoa y học cổ truyền với công nghệ xử lý ngôn ngữ lớn hiện đại
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden border-border/50 bg-card p-0">
              <div className="relative h-56 w-full">
                <Image
                  src="/images/bagua-symbol.jpg"
                  alt="Bát Quái"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-foreground">Hệ thống Bát Quái</CardTitle>
                <CardDescription>
                  Ánh xạ 8 quẻ với cơ quan cơ thể
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden border-border/50 bg-card p-0">
              <div className="relative h-56 w-full">
                <Image
                  src="/images/yin-yang-balance.jpg"
                  alt="Ngũ Hành"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-foreground">Ngũ Hành</CardTitle>
                <CardDescription>
                  Mối quan hệ sinh khắc giữa các nguyên tố
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden border-border/50 bg-card p-0">
              <div className="relative h-56 w-full">
                <Image
                  src="/images/ancient-wisdom.jpg"
                  alt="Tri thức"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-foreground">Tri thức Cổ truyền</CardTitle>
                <CardDescription>
                  Phương pháp Thiệu Khang Tiết
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-b from-background to-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-4">
              Câu hỏi thường gặp
            </Badge>
            <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
              Tìm hiểu về Mai Hoa Tâm Pháp
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
              Giải đáp những thắc mắc phổ biến về hệ thống chẩn đoán
            </p>
          </div>

          <Accordion type="single" collapsible className="mx-auto max-w-3xl">
            <AccordionItem value="item-1" className="border-border/50">
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                Mai Hoa Dịch Số là gì?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Mai Hoa Dịch Số là phương pháp bói toán cổ đại do Thiệu Khang Tiết (Thiệu Ung) sáng lập vào đời Tống. 
                Phương pháp này sử dụng thời gian và các yếu tố tự nhiên để lập quẻ Dịch, từ đó phân tích và dự đoán 
                các vấn đề về sức khỏe, vận mệnh.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-border/50">
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                Hệ thống hoạt động như thế nào?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Hệ thống tự động tính toán quẻ Tiên thiên dựa trên thời gian bạn nhập vào. Sau đó, AI sẽ phân tích 
                mối quan hệ Ngũ Hành giữa các quẻ và Hào động để đưa ra nhận định về tình trạng sức khỏe, 
                cơ quan có thể bị ảnh hưởng và hướng điều trị theo y học cổ truyền.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-border/50">
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                Kết quả chẩn đoán có chính xác không?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Kết quả mang tính chất tham khảo dựa trên lý thuyết Dịch học và Đông y cổ truyền. 
                Đây không phải là chẩn đoán y khoa chính thức. Nếu có vấn đề sức khỏe, bạn nên 
                tham khảo ý kiến bác sĩ hoặc thầy thuốc có chuyên môn.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-border/50">
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                Quẻ Chủ, Quẻ Biến và Quẻ Hổ là gì?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <strong>Quẻ Chủ (Bản quái):</strong> Phản ánh tình trạng hiện tại của người hỏi. 
                <strong> Quẻ Biến:</strong> Cho thấy xu hướng phát triển trong tương lai. 
                <strong> Quẻ Hổ (Hỗ quái):</strong> Thể hiện những yếu tố tiềm ẩn bên trong, 
                giúp phân tích sâu hơn về nguyên nhân gốc rễ của vấn đề.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-border/50">
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                Tại sao cần nhập đúng thời gian?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Trong Mai Hoa Dịch Số, thời gian là yếu tố quyết định để tính toán Thượng quái và Hạ quái. 
                Ngày, tháng, năm (âm lịch) dùng để tính Thượng quái, còn giờ dùng để tính Hạ quái và Hào động. 
                Thời gian chính xác giúp kết quả phân tích phản ánh đúng vấn đề bạn đang quan tâm.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl">☯</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Mai Hoa Tâm Pháp</h3>
                  <p className="text-xs text-muted-foreground">梅花心法</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Hệ thống chẩn đoán sức khỏe dựa trên Dịch học cổ truyền
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground">Liên kết</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#lap-que" className="transition-colors hover:text-foreground">
                    Lập quẻ
                  </a>
                </li>
                <li>
                  <a href="/knowledge" className="transition-colors hover:text-foreground">
                    Knowledge Base
                  </a>
                </li>
                <li>
                  <a href="#gioi-thieu" className="transition-colors hover:text-foreground">
                    Giới thiệu
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground">Tri thức</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/knowledge" className="transition-colors hover:text-foreground">
                    Bát Quái
                  </a>
                </li>
                <li>
                  <a href="/knowledge" className="transition-colors hover:text-foreground">
                    Lục Thần & Lục Thân
                  </a>
                </li>
                <li>
                  <a href="/knowledge" className="transition-colors hover:text-foreground">
                    Hệ thống Hào vị
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: support@maihoatamphat.com</li>
                <li>Hotline: 1900-xxxx</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
            <p>© 2025 Mai Hoa Tâm Pháp. Phát triển bởi AI & Dịch học.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
