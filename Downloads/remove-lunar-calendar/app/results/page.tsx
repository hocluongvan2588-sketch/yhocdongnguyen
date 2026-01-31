'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { MaiHuaResult } from '@/lib/utils/maihua-engine';
import type { DiagnosticResult } from '@/lib/utils/diagnostic-engine';
import { generateTuongSoFromDiagnosis, evaluateServiceRecommendations, type AIAnalysisData } from '@/lib/utils/tuong-so-engine';
import { AlertTriangle, CheckCircle2, Info, Sparkles, Loader2, Heart, Utensils, Clock, Activity, Pill, Target, Zap, TrendingUp, Ban, Coffee, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DateTimeInfo from '@/components/DateTimeInfo';
import Header from '@/components/Header';

interface ResultsData {
  maihua: MaiHuaResult;
  diagnostic: DiagnosticResult;
  patientContext: {
    age: number;
    gender: string;
    subject: string;
    question: string;
  };
}

interface AIAnalysis {
  summary: string;
  explanation: string | Record<string, string>;
  symptoms: string[];
  emotionalConnection: {
    emotion: string;
    organ: string;
    westernExplanation: string;
    advice: string;
  };
  diet: {
    shouldEat: string[];
    shouldAvoid: string[];
    drinks: string[];
  };
  lifestyle: string[];
  prognosis: {
    outlook: string;
    recoveryTime: string;
    improvementSigns: string[];
    warningSigns: string[];
    seasonalFactor?: {
      currentSeason: string;
      compatibility: string;
      explanation: string;
    };
  };
  treatmentOrigin?: {
    affectedOrgan: string;
    motherOrgan: string;
    explanation: string;
    treatmentDirection: string;
  };
  serviceRecommendations: {
    herbalMedicine: {
      recommended: boolean;
      reason: string;
    };
    acupressure: {
      recommended: boolean;
      reason: string;
    };
    energyNumber: {
      recommended: boolean;
      reason: string;
    };
  };
  recommendations?: string[];
  cautionNote?: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<ResultsData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const insights = { summary: '', explanation: '', symptoms: [], recommendations: [], cautionNote: '' };

  useEffect(() => {
    const storedData = sessionStorage.getItem('diagnostic-results');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);
      
      // Gọi API để lấy phân tích AI
      fetchAIAnalysis(parsedData);
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchAIAnalysis = async (resultsData: ResultsData) => {
    try {
      setIsLoadingAI(true);
      setAiError(null);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultsData),
      });

      const result = await response.json();

      if (result.success) {
        setAiAnalysis(result.analysis);
      } else {
        setAiError(result.error || 'Không thể phân tích');
      }
    } catch (error) {
      console.error('[v0] AI fetch error:', error);
      setAiError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="text-muted-foreground">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  const { maihua, diagnostic, patientContext } = data;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'nặng':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'nhẹ':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const renderHexagramLines = (lines: boolean[], movingLine?: number) => {
    // lines[0] = hào 1 (dưới cùng), lines[5] = hào 6 (trên cùng)
    // Hiển thị từ trên xuống dưới: hào 6 -> hào 1
    return (
      <div className="relative flex flex-col items-center gap-2.5">
        {[6, 5, 4, 3, 2, 1].map((lineNumber) => {
          const isYang = lines[lineNumber - 1]; // lines[0] = hào 1, lines[5] = hào 6
          const isMoving = movingLine === lineNumber;
          
          return (
            <div key={lineNumber} className="relative flex w-28 items-center justify-center">
              {isYang ? (
                <div className="h-2.5 w-full rounded-sm bg-foreground" />
              ) : (
                <div className="flex w-full items-center justify-between">
                  <div className="h-2.5 w-[45%] rounded-sm bg-foreground" />
                  <div className="h-2.5 w-[45%] rounded-sm bg-foreground" />
                </div>
              )}
              {isMoving && (
                <span className="absolute -right-6 text-sm font-bold text-primary">
                  {isYang ? '○' : '✕'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <Header 
        title="Kết quả Chẩn đoán" 
        subtitle="Mai Hoa Tâm Pháp" 
        showBackButton={true} 
        backUrl="/" 
      />

      <main className="container mx-auto max-w-5xl px-4 py-8">
        {/* Banner giải thích về tinh thần hỏi quẻ */}
        <Alert className="mb-6 border-amber-500/30 bg-amber-500/5">
          <BookOpen className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-700 font-semibold">Về kết quả chẩn đoán Mai Hoa</AlertTitle>
          <AlertDescription className="mt-2 text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Nguyên lý:</strong> Kết quả dựa trên thời điểm hỏi quẻ theo phương pháp Mai Hoa Dịch Số của Thiệu Khang Tiết. 
              Mỗi thời điểm khác nhau sẽ cho quẻ tượng khác nhau - đây là nguyên lý cốt lõi, không phải sai số.
            </p>
            <p>
              <strong className="text-foreground">Lưu ý quan trọng:</strong> Khi hỏi quẻ, tâm cần tĩnh lặng, tập trung vào vấn đề muốn hỏi. 
              Kết quả mang tính tham khảo theo y lý Dịch học cổ truyền, không thay thế chẩn đoán y khoa. 
              Nếu có vấn đề sức khỏe nghiêm trọng, hãy đến cơ sở y tế.
            </p>
          </AlertDescription>
        </Alert>

        {/* Context Card */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              {/* Left: Patient Info */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="font-medium text-foreground">{patientContext.gender}</span>
                    <span className="text-muted-foreground">, {patientContext.age} tuổi</span>
                  </div>
                  <div className="text-muted-foreground">
                    Xem cho: <span className="font-medium text-foreground">
                      {patientContext.subject === 'banthan' ? 'Bản thân' :
                       patientContext.subject === 'cha' ? 'Cha' :
                       patientContext.subject === 'me' ? 'Mẹ' :
                       patientContext.subject === 'con' ? 'Con' :
                       patientContext.subject === 'vo' ? 'Vợ' :
                       patientContext.subject === 'chong' ? 'Chồng' :
                       patientContext.subject === 'anh-chi-em' ? 'Anh chị em' : 'Người khác'}
                    </span>
                  </div>
                </div>
                {patientContext.question && (
                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <p className="text-sm italic text-muted-foreground">"{patientContext.question}"</p>
                  </div>
                )}
              </div>
              
              {/* Right: DateTime Info */}
              <DateTimeInfo />
            </div>
          </CardContent>
        </Card>

        {/* Quẻ tượng - Hiển thị đầu tiên */}
        <Card className="mb-6 border-border bg-card shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Chi tiết Quẻ tượng</CardTitle>
            <CardDescription>Kết quả lập quẻ theo phương pháp Thiệu Khang Tiết</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Quẻ Chủ */}
              <div className="flex flex-col items-center space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="text-center">
                  <h4 className="mb-1 font-semibold text-foreground">Quẻ Chủ</h4>
                  <p className="text-sm font-medium text-primary">{maihua.mainHexagram.name}</p>
                </div>
                {renderHexagramLines(maihua.mainHexagram.lines, maihua.movingLine)}
                <Badge variant="outline" className="bg-transparent">Hào động: {maihua.movingLine}</Badge>
                <p className="text-xs text-left text-muted-foreground">{maihua.interpretation.health}</p>
              </div>

              {/* Quẻ Hổ */}
              <div className="flex flex-col items-center space-y-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
                <div className="text-center">
                  <h4 className="mb-1 font-semibold text-foreground">Quẻ Hổ</h4>
                  <p className="text-sm font-medium text-accent-foreground">{maihua.mutualHexagram.name}</p>
                </div>
                {renderHexagramLines(maihua.mutualHexagram.lines)}
                <Badge variant="outline" className="bg-transparent">Trạng thái trung gian</Badge>
                <p className="text-xs text-left text-muted-foreground">{maihua.interpretation.mutual}</p>
              </div>

              {/* Quẻ Biến */}
              <div className="flex flex-col items-center space-y-3 rounded-lg border border-secondary/20 bg-secondary/5 p-4">
                <div className="text-center">
                  <h4 className="mb-1 font-semibold text-foreground">Quẻ Biến</h4>
                  <p className="text-sm font-medium text-secondary">{maihua.changedHexagram.name}</p>
                </div>
                {renderHexagramLines(maihua.changedHexagram.lines)}
                <Badge variant="secondary">Xu hướng diễn biến</Badge>
                <p className="text-xs text-left text-muted-foreground">{maihua.interpretation.trend}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main AI Insights - Tầng 1 */}
        <Card className="mb-6 border-primary/30 bg-card shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl text-foreground">Phân tích từ Mai Hoa Dịch Số</CardTitle>
            </div>
            <CardDescription>Diễn giải bởi chuyên gia AI theo y lý Dịch học cổ truyền</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingAI ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">AI đang phân tích kết quả...</p>
                <p className="mt-2 text-xs text-muted-foreground">Vui lòng đợi trong giây lát</p>
              </div>
            ) : aiError ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
                  <div>
                    <p className="mb-2 font-semibold text-foreground">Không thể tải phân tích AI</p>
                    <p className="text-sm text-muted-foreground">{aiError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 bg-transparent"
                      onClick={() => fetchAIAnalysis(data)}
                    >
                      Thử lại
                    </Button>
                  </div>
                </div>
              </div>
            ) : aiAnalysis ? (
              <>
                {/* Tổng quan */}
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                    {getSeverityIcon(diagnostic.expertAnalysis.tiDung.severity)}
                    Tổng quan tình trạng
                  </h3>
                  <p className="text-base leading-relaxed text-foreground">
                    {aiAnalysis.summary}
                  </p>
                </div>

                {/* Giải thích y lý */}
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <h3 className="mb-2 text-base font-semibold text-foreground">Phân tích y lý (Đông - Tây y kết hợp)</h3>
                  <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {typeof aiAnalysis.explanation === 'string' 
                      ? aiAnalysis.explanation 
                      : typeof aiAnalysis.explanation === 'object' && aiAnalysis.explanation !== null
                        ? Object.values(aiAnalysis.explanation).filter(v => typeof v === 'string').join('\n\n')
                        : ''}
                  </div>
                  
                  {/* Kết luận: Bệnh từ tạng nào phát sinh */}
                  {aiAnalysis.treatmentOrigin && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <h4 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="text-lg">&#9775;</span>
                        Kết luận: Bệnh từ tạng nào phát sinh
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex flex-wrap gap-3">
                          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/30">
                            Tạng bệnh: {aiAnalysis.treatmentOrigin.affectedOrgan}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                            Tạng mẹ cần bổ: {aiAnalysis.treatmentOrigin.motherOrgan}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Giải thích:</span> {aiAnalysis.treatmentOrigin.explanation}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Hướng điều trị:</span> {aiAnalysis.treatmentOrigin.treatmentDirection}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Triệu chứng có thể gặp */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                    <Activity className="h-5 w-5 text-primary" />
                    Triệu chứng có thể gặp
                  </h3>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {aiAnalysis.symptoms.map((symptom, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mối liên hệ Cảm xúc - Bệnh lý */}
                {aiAnalysis.emotionalConnection && (
                  <div className="rounded-lg border border-pink-500/20 bg-pink-500/5 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                      <Heart className="h-5 w-5 text-pink-500" />
                      Mối liên hệ Cảm xúc - Bệnh lý
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-pink-500/10 text-pink-700 border-pink-500/30">
                          {aiAnalysis.emotionalConnection.emotion}
                        </Badge>
                        <Badge variant="outline" className="bg-transparent">
                          Ảnh hưởng: {aiAnalysis.emotionalConnection.organ}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Theo y học hiện đại:</span> {aiAnalysis.emotionalConnection.westernExplanation}
                      </p>
                      <div className="pt-2 border-t border-pink-500/20">
                        <p className="text-sm">
                          <span className="font-medium text-foreground">Lời khuyên:</span>{' '}
                          <span className="text-muted-foreground">{aiAnalysis.emotionalConnection.advice}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chế độ ăn uống */}
                {aiAnalysis.diet && (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                      <Utensils className="h-5 w-5 text-green-600" />
                      Chế độ ăn uống (Dược thực đồng nguyên)
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Nên ăn */}
                      <div>
                        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          Nên ăn
                        </h4>
                        <ul className="space-y-1.5">
                          {aiAnalysis.diet.shouldEat.map((food, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-green-500" />
                              {food}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Nên kiêng */}
                      <div>
                        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-600">
                          <Ban className="h-4 w-4" />
                          Nên kiêng
                        </h4>
                        <ul className="space-y-1.5">
                          {aiAnalysis.diet.shouldAvoid.map((food, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-500" />
                              {food}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {/* Thức uống */}
                    {aiAnalysis.diet.drinks && aiAnalysis.diet.drinks.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-green-500/20">
                        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <Coffee className="h-4 w-4 text-amber-600" />
                          Thức uống hỗ trợ
                        </h4>
                        <ul className="flex flex-wrap gap-2">
                          {aiAnalysis.diet.drinks.map((drink, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground bg-amber-500/10 px-3 py-1 rounded-full">
                              {drink}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Lời khuyên sinh hoạt */}
                {aiAnalysis.lifestyle && aiAnalysis.lifestyle.length > 0 && (
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Lời khuyên sinh hoạt
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.lifestyle.map((advice, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                          <span className="text-muted-foreground">{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tiên lượng và thời gian hồi phục */}
                {aiAnalysis.prognosis && (
                  <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                      <Clock className="h-5 w-5 text-indigo-600" />
                      Tiên lượng & Thời gian hồi phục
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 border-indigo-500/30">
                          {aiAnalysis.prognosis.outlook}
                        </Badge>
                        <Badge variant="outline" className="bg-transparent">
                          {aiAnalysis.prognosis.recoveryTime}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        {/* Dấu hiệu cải thiện */}
                        <div>
                          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-700">
                            <TrendingUp className="h-4 w-4" />
                            Dấu hiệu đang cải thiện
                          </h4>
                          <ul className="space-y-1">
                            {aiAnalysis.prognosis.improvementSigns.map((sign, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-1.5">
                                <span className="text-green-500">+</span> {sign}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* Dấu hiệu cảnh báo */}
                        <div>
                          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            Cần khám ngay nếu
                          </h4>
                          <ul className="space-y-1">
                            {aiAnalysis.prognosis.warningSigns.map((sign, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-1.5">
                                <span className="text-red-500">!</span> {sign}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Yếu tố mùa */}
                      {aiAnalysis.prognosis.seasonalFactor && (
                        <div className="mt-3 pt-3 border-t border-indigo-500/20">
                          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                            <span className="text-base">&#127807;</span>
                            Yếu tố mùa ảnh hưởng
                          </h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                              Mùa: {aiAnalysis.prognosis.seasonalFactor.currentSeason}
                            </Badge>
                            <Badge variant="outline" className={`${
                              aiAnalysis.prognosis.seasonalFactor.compatibility === 'Thuận mùa' 
                                ? 'bg-green-500/10 text-green-700 border-green-500/30'
                                : aiAnalysis.prognosis.seasonalFactor.compatibility === 'Nghịch mùa'
                                  ? 'bg-red-500/10 text-red-700 border-red-500/30'
                                  : 'bg-transparent'
                            }`}>
                              {aiAnalysis.prognosis.seasonalFactor.compatibility}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {aiAnalysis.prognosis.seasonalFactor.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Gợi ý dịch vụ chuyên sâu */}
                {aiAnalysis.serviceRecommendations && (
                  <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
                    {(() => {
                      // Đánh giá dịch vụ dựa trên tiên lượng và tình trạng bệnh
                      const analysisData: AIAnalysisData = {
                        prognosis: aiAnalysis.prognosis,
                        treatmentOrigin: aiAnalysis.treatmentOrigin,
                        emotionalConnection: aiAnalysis.emotionalConnection,
                        symptoms: aiAnalysis.symptoms,
                      };
                      
                      const smartRecommendations = evaluateServiceRecommendations(analysisData);
                      const affectedOrgan = aiAnalysis.treatmentOrigin?.affectedOrgan || '';
                      const tuongSoData = generateTuongSoFromDiagnosis(affectedOrgan);
                      
                      return (
                        <>
                          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Gợi ý dịch vụ chuyên sâu
                            <span className="text-xs font-normal text-muted-foreground ml-2">
                              (Dựa trên tiên lượng và tình trạng)
                            </span>
                          </h3>
                          <div className="grid gap-3 md:grid-cols-3">
                            {/* Bài thuốc Đông y */}
                            <div className={`rounded-lg border p-3 flex flex-col ${
                              smartRecommendations.herbalMedicine.recommended 
                                ? smartRecommendations.herbalMedicine.priority === 'high'
                                  ? 'border-green-500/50 bg-green-500/10'
                                  : 'border-green-500/30 bg-green-500/5'
                                : 'border-border/50 bg-muted/20 opacity-60'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Pill className={`h-5 w-5 ${
                                  smartRecommendations.herbalMedicine.recommended 
                                    ? 'text-green-600' 
                                    : 'text-muted-foreground'
                                }`} />
                                <h4 className="font-semibold text-sm text-foreground">Bài thuốc Đông y</h4>
                                {smartRecommendations.herbalMedicine.recommended && (
                                  <Badge className={`ml-auto text-xs ${
                                    smartRecommendations.herbalMedicine.priority === 'high' 
                                      ? 'bg-green-600' 
                                      : 'bg-green-500'
                                  }`}>
                                    {smartRecommendations.herbalMedicine.priority === 'high' ? 'Ưu tiên' : 'Phù hợp'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {smartRecommendations.herbalMedicine.reason}
                              </p>
                              {smartRecommendations.herbalMedicine.recommended && (
                                <p className="text-xs text-green-700 italic flex-grow">
                                  {smartRecommendations.herbalMedicine.detailedReason}
                                </p>
                              )}
                              {smartRecommendations.herbalMedicine.recommended && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-3 w-full border-green-500/50 text-green-700 hover:bg-green-500/10 bg-transparent"
                                  onClick={() => router.push('/checkout/bai-thuoc-dong-y')}
                                >
                                  <Pill className="mr-1.5 h-3.5 w-3.5" />
                                  Xem bài thuốc phù hợp
                                </Button>
                              )}
                            </div>

                            {/* Huyệt vị */}
                            <div className={`rounded-lg border p-3 flex flex-col ${
                              smartRecommendations.acupressure.recommended 
                                ? smartRecommendations.acupressure.priority === 'high'
                                  ? 'border-blue-500/50 bg-blue-500/10'
                                  : 'border-blue-500/30 bg-blue-500/5'
                                : 'border-border/50 bg-muted/20 opacity-60'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Target className={`h-5 w-5 ${
                                  smartRecommendations.acupressure.recommended 
                                    ? 'text-blue-600' 
                                    : 'text-muted-foreground'
                                }`} />
                                <h4 className="font-semibold text-sm text-foreground">Huyệt vị bấm/châm</h4>
                                {smartRecommendations.acupressure.recommended && (
                                  <Badge className={`ml-auto text-xs ${
                                    smartRecommendations.acupressure.priority === 'high' 
                                      ? 'bg-blue-600' 
                                      : 'bg-blue-500'
                                  }`}>
                                    {smartRecommendations.acupressure.priority === 'high' ? 'Ưu tiên' : 'Phù hợp'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {smartRecommendations.acupressure.reason}
                              </p>
                              {smartRecommendations.acupressure.recommended && (
                                <p className="text-xs text-blue-700 italic flex-grow">
                                  {smartRecommendations.acupressure.detailedReason}
                                </p>
                              )}
                              <p className="mt-2 text-xs text-muted-foreground italic">Sắp ra mắt</p>
                            </div>

                            {/* Tượng Số Bát Quái */}
                            <div className={`rounded-lg border p-3 flex flex-col ${
                              smartRecommendations.energyNumber.recommended 
                                ? smartRecommendations.energyNumber.priority === 'high'
                                  ? 'border-purple-500/50 bg-purple-500/10'
                                  : 'border-purple-500/30 bg-purple-500/5'
                                : 'border-border/50 bg-muted/20 opacity-60'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className={`h-5 w-5 ${
                                  smartRecommendations.energyNumber.recommended 
                                    ? 'text-purple-600' 
                                    : 'text-muted-foreground'
                                }`} />
                                <h4 className="font-semibold text-sm text-foreground">Tượng Số Bát Quái</h4>
                                {smartRecommendations.energyNumber.recommended && (
                                  <Badge className={`ml-auto text-xs ${
                                    smartRecommendations.energyNumber.priority === 'high' 
                                      ? 'bg-purple-600' 
                                      : 'bg-purple-500'
                                  }`}>
                                    {smartRecommendations.energyNumber.priority === 'high' ? 'Ưu tiên' : 'Phù hợp'}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Hiển thị công thức Tượng Số nếu có */}
                              {tuongSoData && smartRecommendations.energyNumber.recommended ? (
                                <div className="space-y-2 flex-grow">
                                  <p className="text-xs text-muted-foreground">
                                    {smartRecommendations.energyNumber.reason}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Quẻ ánh xạ:</span>
                                    <Badge variant="outline" className="bg-transparent text-purple-700 border-purple-300">
                                      {tuongSoData.guaName} ({tuongSoData.element})
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Công thức:</span>
                                    <span className="font-mono text-sm font-bold text-purple-700">
                                      {tuongSoData.formula}
                                    </span>
                                  </div>
                                  <p className="text-xs text-purple-600 italic">
                                    {tuongSoData.usage}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground flex-grow">
                                  {smartRecommendations.energyNumber.reason}
                                </p>
                              )}
                              
                              {smartRecommendations.energyNumber.recommended && (
                                <Button
                                  size="sm"
                                  className="mt-3 w-full"
                                  onClick={() => router.push('/checkout/tuong-so-bat-quai')}
                                >
                                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                  Xem chi tiết công thức
                                </Button>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}

                  </div>
                )}

                {/* Cảnh báo nghiêm trọng */}
                {(diagnostic.expertAnalysis.diseaseFlags.isCritical || 
                  diagnostic.expertAnalysis.tiDung.severity === 'nặng') && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                      <p className="text-sm font-medium text-foreground">
                        Kết quả cho thấy dấu hiệu cần chú ý đặc biệt. Nên đi khám bác sĩ để được tư vấn và điều trị kịp thời.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <div>
                <h3 className="mb-2 font-semibold text-foreground">Miễn trừ trách nhiệm</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Kết quả chỉ mang tính tham vấn năng lượng và tâm linh dựa trên phương pháp Mai Hoa Thần Số và y lý Dịch học cổ truyền. 
                  <strong className="text-foreground"> Đây KHÔNG phải là chẩn đoán y học chuyên nghiệp</strong> và không thay thế cho khám lâm sàng, 
                  xét nghiệm hoặc tư vấn của bác sĩ. Nếu có triệu chứng bất thường, vui lòng đến cơ sở y tế để được thăm khám và điều trị kịp thời.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logic Module 3 & 4 được giữ lại để sử dụng sau này */}
        {/* Dữ liệu vẫn có trong diagnostic.mapping và diagnostic.expertAnalysis */}
      </main>
    </div>
  );
}
