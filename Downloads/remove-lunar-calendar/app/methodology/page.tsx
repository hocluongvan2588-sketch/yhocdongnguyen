'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Heart, Scale, Clock, ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const BAGUA_BODY_MAP = [
  { trigram: 'Ly', symbol: '☲', element: 'Hỏa', organs: ['Tim', 'Mắt', 'Mạch máu'], diseases: ['Bệnh tim mạch', 'Huyết áp', 'Thị lực'] },
  { trigram: 'Khảm', symbol: '☵', element: 'Thủy', organs: ['Thận', 'Bàng quang', 'Tai'], diseases: ['Bệnh thận', 'Thính giác', 'Sinh dục'] },
  { trigram: 'Chấn', symbol: '☳', element: 'Mộc', organs: ['Gan', 'Chân', 'Thần kinh'], diseases: ['Bệnh gan', 'Co giật', 'Căng thẳng'] },
  { trigram: 'Đoài', symbol: '☱', element: 'Kim', organs: ['Phổi', 'Miệng', 'Họng'], diseases: ['Hô hấp', 'Răng miệng', 'Da liễu'] },
  { trigram: 'Càn', symbol: '☰', element: 'Kim', organs: ['Đầu', 'Não', 'Xương'], diseases: ['Đau đầu', 'Xương khớp', 'Huyết áp'] },
  { trigram: 'Khôn', symbol: '☷', element: 'Thổ', organs: ['Bụng', 'Lá lách', 'Dạ dày'], diseases: ['Tiêu hóa', 'U bướu', 'Cơ bắp'] },
  { trigram: 'Cấn', symbol: '☶', element: 'Thổ', organs: ['Tay', 'Lưng', 'Khớp'], diseases: ['Cột sống', 'Khớp tay', 'Tiêu hóa'] },
  { trigram: 'Tốn', symbol: '☴', element: 'Mộc', organs: ['Mật', 'Đùi', 'Hông'], diseases: ['Bệnh mật', 'Phong thấp', 'Dị ứng'] },
];

const WUXING_ORGANS = [
  { element: 'Mộc', color: 'bg-green-100 text-green-800 border-green-200', yin: 'Can (Gan)', yang: 'Đởm (Mật)', emotion: 'Tức giận' },
  { element: 'Hỏa', color: 'bg-red-100 text-red-800 border-red-200', yin: 'Tâm (Tim)', yang: 'Tiểu trường', emotion: 'Vui mừng' },
  { element: 'Thổ', color: 'bg-amber-100 text-amber-800 border-amber-200', yin: 'Tỳ (Lá lách)', yang: 'Vị (Dạ dày)', emotion: 'Lo nghĩ' },
  { element: 'Kim', color: 'bg-gray-100 text-gray-800 border-gray-200', yin: 'Phế (Phổi)', yang: 'Đại trường', emotion: 'Buồn bã' },
  { element: 'Thủy', color: 'bg-blue-100 text-blue-800 border-blue-200', yin: 'Thận', yang: 'Bàng quang', emotion: 'Sợ hãi' },
];

const FAQ_ITEMS = [
  {
    question: 'Mai Hoa Dịch Số có phải là mê tín không?',
    answer: 'Mai Hoa Dịch Số là một hệ thống triết học và phương pháp luận có lịch sử hơn 1000 năm, được phát triển bởi nhà triết học Thiệu Khang Tiết thời Bắc Tống. Nó dựa trên nguyên lý toán học và quy luật tự nhiên của Kinh Dịch, không phải niềm tin siêu nhiên. Tuy nhiên, cần hiểu rằng đây là công cụ tham khảo văn hóa và tâm linh, không phải phương pháp y khoa hiện đại.'
  },
  {
    question: 'Tại sao thời gian lập quẻ lại quan trọng?',
    answer: 'Y học cổ truyền và khoa học hiện đại đều công nhận mối liên hệ giữa thời gian và sức khỏe. Nhịp sinh học (Circadian rhythm) ảnh hưởng đến hormone, huyết áp, và nhiều chức năng cơ thể. Trong Mai Hoa, thời gian là "cửa sổ" phản ánh trạng thái năng lượng của cơ thể tại khoảnh khắc đó - tương tự như việc đo huyết áp hay nhịp tim tại một thời điểm cụ thể.'
  },
  {
    question: 'Kết quả có chính xác không?',
    answer: 'Độ chính xác phụ thuộc vào nhiều yếu tố: sự thành tâm khi khởi quẻ, kiến thức diễn giải của người thực hành, và tính chất của câu hỏi. Mai Hoa Dịch Số hiệu quả nhất khi được sử dụng như công cụ định hướng và tham khảo, không phải để thay thế chẩn đoán y khoa. Chúng tôi khuyến khích kết hợp với khám sức khỏe định kỳ.'
  },
  {
    question: 'Có cơ sở khoa học nào hỗ trợ phương pháp này không?',
    answer: 'Một số khái niệm trong Y học Dịch lý có sự tương đồng với khoa học hiện đại: Thuyết Đồng bộ (Synchronicity) của Carl Jung về mối liên hệ ý nghĩa giữa các sự kiện; Y học thời gian (Chronobiology) nghiên cứu nhịp sinh học; Y học Tâm-Thân (Psychosomatic medicine) về ảnh hưởng của tâm lý lên cơ thể. Ngũ Hành cũng có điểm tương đồng với lý thuyết hệ thống trong sinh học hiện đại.'
  },
  {
    question: 'Tôi có nên ngừng điều trị y tế để theo phương pháp này?',
    answer: 'Tuyệt đối không. Mai Hoa Dịch Số là công cụ bổ trợ, không bao giờ thay thế điều trị y khoa. Nếu bạn đang có bệnh hoặc triệu chứng, hãy tiếp tục điều trị theo chỉ định của bác sĩ. Phương pháp này có thể giúp bạn hiểu thêm về cơ thể từ góc nhìn truyền thống, nhưng mọi quyết định y tế phải dựa trên ý kiến chuyên môn.'
  },
  {
    question: 'Ai phù hợp sử dụng hệ thống này?',
    answer: 'Hệ thống phù hợp với những người: muốn tìm hiểu văn hóa và triết học Đông phương; quan tâm đến y học cổ truyền như một góc nhìn bổ sung; cần định hướng tổng quát về sức khỏe để có động lực chăm sóc bản thân tốt hơn; đang tìm kiếm sự cân bằng giữa tâm và thân. Không khuyến khích cho người đang trong tình trạng sức khỏe nghiêm trọng cần can thiệp y tế khẩn cấp.'
  },
];

export default function MethodologyPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('intro');

  return (
    <div className="min-h-screen bg-background">
      <Header title="Mai Hoa Tâm Pháp" subtitle="Phương pháp luận" showBackButton backUrl="/" />

      {/* Hero Section */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/5 text-primary">
              Cơ sở Lý luận
            </Badge>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Hiểu về Y lý Dịch học
            </h1>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              Khám phá nguyên lý đằng sau phương pháp Mai Hoa Dịch Số trong chẩn đoán sức khỏe - 
              từ triết học cổ đại đến những kết nối với khoa học hiện đại.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Pills */}
      <section className="sticky top-16 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {[
              { id: 'intro', label: 'Giới thiệu', icon: BookOpen },
              { id: 'science', label: 'Cơ sở Khoa học', icon: Brain },
              { id: 'medical', label: 'Y lý Dịch học', icon: Heart },
              { id: 'limits', label: 'Giới hạn', icon: Scale },
              { id: 'faq', label: 'FAQ', icon: ChevronDown },
            ].map((item) => (
              <Button
                key={item.id}
                variant={expandedSection === item.id ? 'default' : 'ghost'}
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => {
                  setExpandedSection(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-16">

          {/* Section 1: Introduction */}
          <section id="intro" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Mai Hoa Dịch Số là gì?</h2>
            </div>
            
            <div className="space-y-6 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                <strong className="text-foreground">Mai Hoa Dịch Số</strong> (梅花易數) là phương pháp chiêm bốc 
                được sáng tạo bởi <strong className="text-foreground">Thiệu Khang Tiết</strong> (Thiệu Ung, 1011-1077), 
                nhà triết học và toán học nổi tiếng thời Bắc Tống, Trung Quốc.
              </p>
              
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <blockquote className="border-l-4 border-primary pl-4 italic">
                    {'"Vạn vật đều có số, mọi hiện tượng đều có thể định lượng. Con người là tiểu vũ trụ, nằm trong vận động của âm dương và ngũ hành."'}
                  </blockquote>
                  <p className="mt-3 text-sm">— Nguyên lý cốt lõi của Mai Hoa Dịch Số</p>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Nguồn gốc tên gọi</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    Tương truyền, Thiệu Ung đang ngắm hoa mai nở trong vườn thì thấy hai chim sẻ tranh cành, 
                    từ đó ông lập quẻ và dự đoán được sự kiện sắp xảy ra. Phương pháp được đặt tên là 
                    {'"Mai Hoa"'} từ câu chuyện này.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Đặc điểm nổi bật</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    Khác với các phương pháp gieo quẻ truyền thống (dùng cỏ thi, đồng xu), Mai Hoa có thể 
                    lập quẻ từ mọi hiện tượng: thời gian, âm thanh, hình ảnh, số đếm - tạo nên sự linh hoạt 
                    và ứng dụng rộng rãi.
                  </CardContent>
                </Card>
              </div>

              <p className="leading-relaxed">
                Trong y học cổ truyền, phương pháp này được ứng dụng để phân tích trạng thái sức khỏe 
                thông qua mối tương quan giữa thời gian, con người và vũ trụ - một góc nhìn bổ sung cho 
                các phương pháp chẩn đoán truyền thống như Tứ Chẩn (Vọng, Văn, Vấn, Thiết).
              </p>
            </div>
          </section>

          {/* Section 2: Scientific Parallels */}
          <section id="science" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Điểm tương đồng với Khoa học Hiện đại</h2>
            </div>

            <p className="mb-8 text-lg text-muted-foreground">
              Mặc dù xuất phát từ triết học cổ đại, một số nguyên lý của Mai Hoa có điểm gặp gỡ 
              thú vị với các nghiên cứu khoa học hiện đại:
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Y học Thời gian (Chronobiology)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Khoa học đã chứng minh nhịp sinh học (Circadian rhythm) ảnh hưởng đến mọi chức năng cơ thể: 
                    hormone, huyết áp, nhiệt độ, khả năng miễn dịch.
                  </p>
                  <p className="font-medium text-foreground">
                    Điểm tương đồng: Mai Hoa sử dụng thời gian (năm, tháng, ngày, giờ) làm cơ sở lập quẻ - 
                    phản ánh quan niệm rằng trạng thái cơ thể thay đổi theo chu kỳ thời gian.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-secondary" />
                    <CardTitle className="text-lg">Thuyết Đồng bộ (Synchronicity)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Carl Jung đề xuất khái niệm {'"meaningful coincidence"'} - sự trùng hợp có ý nghĩa 
                    giữa các sự kiện không có quan hệ nhân quả trực tiếp nhưng có liên hệ về mặt ý nghĩa.
                  </p>
                  <p className="font-medium text-foreground">
                    Điểm tương đồng: Mai Hoa dựa trên nguyên lý {'"thiên nhân hợp nhất"'} - con người 
                    và vũ trụ phản ánh lẫn nhau tại mỗi khoảnh khắc.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-accent" />
                    <CardTitle className="text-lg">Y học Tâm-Thân (Psychosomatic)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Y học hiện đại công nhận mối liên hệ chặt chẽ giữa tâm lý và thể chất: 
                    stress gây loét dạ dày, lo âu ảnh hưởng tim mạch, trầm cảm suy giảm miễn dịch.
                  </p>
                  <p className="font-medium text-foreground">
                    Điểm tương đồng: Ngũ Hành trong Đông y liên kết 5 tạng với 5 cảm xúc 
                    (Gan-Giận, Tim-Vui, Tỳ-Lo, Phổi-Buồn, Thận-Sợ).
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-destructive">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-lg">Lý thuyết Hệ thống (Systems Theory)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Sinh học hệ thống nghiên cứu cơ thể như một mạng lưới tương tác phức tạp, 
                    nơi mỗi bộ phận ảnh hưởng và được ảnh hưởng bởi toàn thể.
                  </p>
                  <p className="font-medium text-foreground">
                    Điểm tương đồng: Ngũ Hành Sinh Khắc mô tả cơ thể như hệ thống các yếu tố 
                    tương sinh tương khắc, duy trì cân bằng động.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <p className="text-sm text-amber-800">
                  <strong>Lưu ý quan trọng:</strong> Những điểm tương đồng này không có nghĩa Mai Hoa Dịch Số 
                  là phương pháp khoa học. Đây chỉ là những góc nhìn thú vị cho thấy triết học cổ đại 
                  đôi khi nắm bắt được các quy luật mà khoa học hiện đại sau này xác nhận bằng phương pháp thực nghiệm.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 3: Medical Yi Theory */}
          <section id="medical" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Y lý Dịch học: Bát Quái và Ngũ Tạng</h2>
            </div>

            <p className="mb-8 text-lg text-muted-foreground">
              Hệ thống chẩn đoán dựa trên hai trụ cột chính: Ma trận Bát Quái ánh xạ với cơ thể, 
              và Ngũ Hành liên kết với Ngũ Tạng.
            </p>

            {/* Bagua Body Map */}
            <div className="mb-10">
              <h3 className="mb-4 text-xl font-semibold text-foreground">Ma trận Bát Quái - Cơ thể</h3>
              <p className="mb-6 text-muted-foreground">
                Mỗi quẻ trong Bát Quái tương ứng với các bộ phận và hệ cơ quan cụ thể:
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {BAGUA_BODY_MAP.map((item) => (
                  <Card key={item.trigram} className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{item.symbol}</span>
                        <Badge variant="outline">{item.element}</Badge>
                      </div>
                      <CardTitle className="text-base">{item.trigram}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div>
                        <p className="font-medium text-foreground">Cơ quan:</p>
                        <p className="text-muted-foreground">{item.organs.join(', ')}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Bệnh lý:</p>
                        <p className="text-muted-foreground">{item.diseases.join(', ')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Five Elements */}
            <div>
              <h3 className="mb-4 text-xl font-semibold text-foreground">Ngũ Hành - Ngũ Tạng - Ngũ Chí</h3>
              <p className="mb-6 text-muted-foreground">
                Hệ thống Ngũ Hành kết nối các yếu tố tự nhiên với cơ quan và cảm xúc:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Hành</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Tạng (Âm)</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Phủ (Dương)</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Cảm xúc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WUXING_ORGANS.map((item) => (
                      <tr key={item.element} className="border-b border-border/50">
                        <td className="px-4 py-3">
                          <Badge className={item.color}>{item.element}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{item.yin}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.yang}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.emotion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Card className="mt-6 border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-sm text-foreground">
                    <strong>Ví dụ thực tế:</strong> Khi quẻ chủ có quái Ly (Hỏa) động ở vị trí Thế, 
                    hệ thống sẽ gợi ý quan tâm đến Tim, huyết áp và tuần hoàn. Nếu kết hợp với 
                    Lục Thần là Chu Tước (viêm, sốt), có thể định hướng đến các vấn đề viêm nhiễm 
                    liên quan đến hệ tim mạch.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 4: Limitations */}
          <section id="limits" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Giới hạn và Lưu ý Quan trọng</h2>
            </div>

            <div className="space-y-4">
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-6">
                  <h3 className="mb-3 text-lg font-semibold text-destructive">Tuyên bố Miễn trừ Trách nhiệm</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-destructive">1.</span>
                      <span>Hệ thống này <strong className="text-foreground">KHÔNG</strong> phải là công cụ chẩn đoán y khoa.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-destructive">2.</span>
                      <span>Kết quả chỉ mang tính chất <strong className="text-foreground">tham khảo văn hóa và tâm linh</strong>.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-destructive">3.</span>
                      <span><strong className="text-foreground">KHÔNG</strong> thay thế cho việc khám và điều trị tại cơ sở y tế.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-destructive">4.</span>
                      <span>Mọi quyết định về sức khỏe cần tham vấn <strong className="text-foreground">bác sĩ chuyên khoa</strong>.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-foreground">Khi nào NÊN sử dụng</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="space-y-1">
                      <li>Tìm hiểu văn hóa và triết học Đông phương</li>
                      <li>Có thêm góc nhìn bổ sung về sức khỏe</li>
                      <li>Tạo động lực chăm sóc bản thân tốt hơn</li>
                      <li>Kết hợp với lối sống lành mạnh</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-foreground">Khi nào KHÔNG NÊN sử dụng</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="space-y-1">
                      <li>Thay thế ý kiến bác sĩ</li>
                      <li>Tự chẩn đoán bệnh nghiêm trọng</li>
                      <li>Trì hoãn điều trị y tế cần thiết</li>
                      <li>Tình trạng khẩn cấp cần cấp cứu</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Section 5: FAQ */}
          <section id="faq" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ChevronDown className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Câu hỏi Thường gặp</h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA Section */}
          <section className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
            <h3 className="mb-3 text-2xl font-bold text-foreground">Sẵn sàng trải nghiệm?</h3>
            <p className="mb-6 text-muted-foreground">
              Khám phá phương pháp Mai Hoa Dịch Số với sự hiểu biết và tâm thế đúng đắn.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/">
                  Bắt đầu Lập quẻ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent">
                <Link href="/knowledge">
                  Xem Knowledge Base
                </Link>
              </Button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
