import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BAGUA_MATRIX } from "@/lib/data/bagua-matrix"
import { LIUSHEN_LIBRARY, LIUQIN_LIBRARY } from "@/lib/data/liushen-liuqin"
import { YAO_SYSTEM } from "@/lib/data/yao-system"
import Header from "@/components/Header"

export default function KnowledgePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header title="Knowledge Base" subtitle="Cơ sở dữ liệu tri thức" showBackButton={true} backUrl="/" />
      
      {/* Page Title Section */}
      <div className="border-b border-border/40 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/5 text-primary">
              Cơ sở dữ liệu tri thức gốc
            </Badge>
            <h1 className="mb-4 text-4xl font-bold text-foreground">Knowledge Base</h1>
            <p className="text-balance text-lg text-muted-foreground">
              Khám phá hệ thống tri thức Dịch học Đông y được số hóa từ các văn bản y lý cổ truyền. 
              Bao gồm Ma trận Bát Quái, Lục Thần, Lục Thân và Hệ thống Hào vị.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="bagua" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="bagua">Bát Quái</TabsTrigger>
            <TabsTrigger value="liushen">Lục Thần</TabsTrigger>
            <TabsTrigger value="liuqin">Lục Thân</TabsTrigger>
            <TabsTrigger value="yao">Hào vị</TabsTrigger>
          </TabsList>

          {/* BÁT QUÁI TAB */}
          <TabsContent value="bagua" className="space-y-6">
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-bold text-foreground">Ma trận Đối ứng Bát Quái</h2>
              <p className="text-muted-foreground">
                Hệ thống ánh xạ 8 quẻ đơn với các bộ phận cơ thể, nguyên tố và bệnh lý tương ứng
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {BAGUA_MATRIX.map((trigram) => (
                <Card key={trigram.id} className="border-border/50 bg-card transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-3xl">
                        {trigram.symbol}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="bg-background">
                          {trigram.element}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {trigram.yinYang}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-foreground">
                      {trigram.name} ({trigram.chineseName})
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {trigram.nature}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">Bộ phận cơ thể:</p>
                      <div className="flex flex-wrap gap-1">
                        {trigram.anatomy.map((part, idx) => (
                          <Badge key={idx} variant="outline" className="bg-accent/10 text-xs">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">Cơ quan chính:</p>
                      <div className="flex flex-wrap gap-1">
                        {trigram.primaryOrgans.map((organ, idx) => (
                          <Badge key={idx} variant="default" className="text-xs">
                            {organ}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">Bệnh lý chính:</p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {trigram.primaryDiseases.slice(0, 4).map((disease, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{disease}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-border/50 pt-3">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Tính cách:</span> {trigram.personality}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* LỤC THẦN TAB */}
          <TabsContent value="liushen" className="space-y-6">
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-bold text-foreground">Thư viện Lục Thần (六神)</h2>
              <p className="text-muted-foreground">
                Sáu thần linh dùng để xác định tính chất và nguyên nhân bệnh lý trong y học cổ truyền
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {LIUSHEN_LIBRARY.map((spirit) => (
                <Card key={spirit.id} className="border-border/50 bg-card">
                  <CardHeader>
                    <div className="mb-3 flex items-center justify-between">
                      <CardTitle className="text-xl text-foreground">
                        {spirit.name} ({spirit.chineseName})
                      </CardTitle>
                      <Badge variant="outline">{spirit.nature.split(' - ')[0]}</Badge>
                    </div>
                    <CardDescription className="text-sm font-medium text-foreground/70">
                      {spirit.medicalMeaning}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">Bệnh lý liên quan:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {spirit.diseases.map((disease, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{disease}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">Triệu chứng:</p>
                      <div className="flex flex-wrap gap-2">
                        {spirit.symptoms.map((symptom, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                      <p className="mb-1 text-xs font-semibold text-foreground">Tâm lý:</p>
                      <p className="text-sm text-muted-foreground">{spirit.psychology}</p>
                    </div>

                    <div className="border-t border-border/50 pt-3">
                      <p className="text-xs font-semibold text-primary">Điều trị:</p>
                      <p className="mt-1 text-sm text-muted-foreground">{spirit.treatment}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* LỤC THÂN TAB */}
          <TabsContent value="liuqin" className="space-y-6">
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-bold text-foreground">Thư viện Lục Thân (六親)</h2>
              <p className="text-muted-foreground">
                Sáu mối quan hệ đại diện cho các hệ thống năng lượng và chức năng trong cơ thể
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {LIUQIN_LIBRARY.map((relation) => (
                <Card key={relation.id} className="border-border/50 bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      {relation.name} ({relation.chineseName})
                    </CardTitle>
                    <CardDescription className="text-sm">
                      <Badge variant="outline" className="mb-2">
                        {relation.nature}
                      </Badge>
                      <p className="mt-2 text-foreground/70">{relation.medicalMeaning}</p>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">Bộ phận cơ thể:</p>
                      <div className="flex flex-wrap gap-1">
                        {relation.bodyParts.map((part, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <p className="mb-1 text-xs font-semibold text-primary">Năng lượng:</p>
                      <p className="text-sm text-foreground">{relation.energy}</p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">Chức năng:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {relation.functions.map((func, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>{func}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* HÀO VỊ TAB */}
          <TabsContent value="yao" className="space-y-6">
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-bold text-foreground">Hệ thống Hào vị Chi tiết</h2>
              <p className="text-muted-foreground">
                Sáu hào tương ứng với các tầng cơ thể từ chân đến đầu, giúp định vị chính xác vị trí bệnh lý
              </p>
            </div>

            <div className="space-y-4">
              {[...YAO_SYSTEM].reverse().map((yao, displayIndex) => {
                const actualIndex = YAO_SYSTEM.length - displayIndex
                return (
                  <Card 
                    key={yao.position} 
                    className={`border-border/50 bg-card transition-all hover:shadow-md ${
                      yao.position === 6 ? 'border-l-4 border-l-red-500/50' :
                      yao.position === 5 ? 'border-l-4 border-l-orange-500/50' :
                      yao.position === 1 ? 'border-l-4 border-l-blue-500/50' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                              {actualIndex}
                            </div>
                            <div>
                              <CardTitle className="text-lg text-foreground">
                                {yao.name} ({yao.chineseName})
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {yao.bodyLevel}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                        <Badge variant={yao.yinYang === 'Yang' ? 'default' : 'secondary'}>
                          {yao.yinYang}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <div>
                            <p className="mb-2 text-xs font-semibold text-muted-foreground">Giải phẫu:</p>
                            <div className="flex flex-wrap gap-1">
                              {yao.anatomy.map((part, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {part}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-xs font-semibold text-muted-foreground">Cơ quan:</p>
                            <div className="flex flex-wrap gap-1">
                              {yao.organs.map((organ, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {organ}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-semibold text-muted-foreground">Bệnh lý:</p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {yao.diseases.slice(0, 5).map((disease, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{disease}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3">
                        <p className="mb-1 text-xs font-semibold text-foreground">Ý nghĩa lâm sàng:</p>
                        <p className="text-sm text-muted-foreground">{yao.clinicalSignificance}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
