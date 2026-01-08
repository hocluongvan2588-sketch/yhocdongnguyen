"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertTriangle, Plus, Download, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface RecallEvent {
  id: string
  recall_number: string
  recall_initiation_date: string
  recall_type: string
  recall_class: string
  recall_reason: string
  product_description: string
  affected_lot_codes: string[]
  recall_status: string
  recovery_percentage: number
  total_units_affected: number
  total_units_recovered: number
}

export default function RecallsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [recalls, setRecalls] = useState<RecallEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [initiateDialogOpen, setInitiateDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Form state
  const [recallType, setRecallType] = useState("")
  const [recallClass, setRecallClass] = useState("")
  const [recallReason, setRecallReason] = useState("")
  const [hazardDescription, setHazardDescription] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [affectedLotCodes, setAffectedLotCodes] = useState("")
  const [distributionPattern, setDistributionPattern] = useState("")
  const [publicNotification, setPublicNotification] = useState(true)

  useEffect(() => {
    fetchRecalls()
  }, [])

  const fetchRecalls = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("recall_events")
        .select("*")
        .order("recall_initiation_date", { ascending: false })

      if (error) throw error
      setRecalls(data || [])
    } catch (error: any) {
      console.error("[v0] Error fetching recalls:", error)
      toast({
        title: "Lỗi tải dữ liệu",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInitiateRecall = async () => {
    if (!recallType || !recallClass || !recallReason || !hazardDescription || !affectedLotCodes) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ các trường bắt buộc",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch("/api/recalls/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recall_type: recallType,
          recall_class: recallClass,
          recall_reason: recallReason,
          hazard_description: hazardDescription,
          product_description: productDescription,
          affected_lot_codes: affectedLotCodes.split(",").map((c) => c.trim()),
          distribution_pattern: distributionPattern,
          public_notification_required: publicNotification,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Thu hồi đã được khởi tạo",
          description: `Mã thu hồi: ${result.recall.recall_number}`,
        })
        setInitiateDialogOpen(false)
        fetchRecalls()
        
        // Reset form
        setRecallType("")
        setRecallClass("")
        setRecallReason("")
        setHazardDescription("")
        setProductDescription("")
        setAffectedLotCodes("")
        setDistributionPattern("")
      } else {
        throw new Error(result.error || "Failed to initiate recall")
      }
    } catch (error: any) {
      toast({
        title: "Lỗi khởi tạo thu hồi",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getClassBadge = (recallClass: string) => {
    switch (recallClass) {
      case "class_i":
        return <Badge variant="destructive">Class I - Nguy hiểm</Badge>
      case "class_ii":
        return <Badge variant="default" className="bg-orange-500">Class II - Trung bình</Badge>
      case "class_iii":
        return <Badge variant="secondary">Class III - Thấp</Badge>
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "initiated":
        return <Badge variant="default">Đã khởi tạo</Badge>
      case "in_progress":
        return <Badge variant="secondary">Đang thực hiện</Badge>
      case "completed":
        return <Badge variant="outline" className="border-green-500 text-green-500">Hoàn thành</Badge>
      case "terminated":
        return <Badge variant="outline">Đã kết thúc</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Thu hồi Sản phẩm</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý các đợt thu hồi sản phẩm theo FSMA 204</p>
        </div>
        <Button onClick={() => setInitiateDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Khởi tạo Thu hồi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5" />
            Danh sách Thu hồi
          </CardTitle>
          <CardDescription>
            {recalls.length} đợt thu hồi, {recalls.filter((r) => r.recall_status === "in_progress").length} đang thực hiện
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : recalls.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có đợt thu hồi nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã thu hồi</TableHead>
                  <TableHead>Ngày khởi tạo</TableHead>
                  <TableHead>Phân loại</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Lô bị ảnh hưởng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tỷ lệ thu hồi</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recalls.map((recall) => (
                  <TableRow key={recall.id}>
                    <TableCell className="font-medium">{recall.recall_number}</TableCell>
                    <TableCell>{new Date(recall.recall_initiation_date).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>{getClassBadge(recall.recall_class)}</TableCell>
                    <TableCell className="max-w-xs truncate">{recall.recall_reason}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{recall.affected_lot_codes?.length || 0} lô</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(recall.recall_status)}</TableCell>
                    <TableCell>
                      {recall.recovery_percentage ? (
                        <span className={recall.recovery_percentage >= 90 ? "text-green-600 font-medium" : ""}>
                          {recall.recovery_percentage.toFixed(1)}%
                        </span>
                      ) : (
                        "0%"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <FileText className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={initiateDialogOpen} onOpenChange={setInitiateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Khởi tạo Thu hồi Sản phẩm</DialogTitle>
            <DialogDescription>
              Tạo đợt thu hồi mới theo quy định FSMA 204. Tất cả các trường đánh dấu (*) là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại thu hồi *</Label>
                <Select value={recallType} onValueChange={setRecallType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại thu hồi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voluntary_firm">Tự nguyện - Do công ty</SelectItem>
                    <SelectItem value="voluntary_fda_request">Tự nguyện - Theo yêu cầu FDA</SelectItem>
                    <SelectItem value="fda_mandated">Bắt buộc bởi FDA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phân loại *</Label>
                <Select value={recallClass} onValueChange={setRecallClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phân loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class_i">Class I - Nguy hiểm cao</SelectItem>
                    <SelectItem value="class_ii">Class II - Nguy hiểm trung bình</SelectItem>
                    <SelectItem value="class_iii">Class III - Nguy hiểm thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lý do thu hồi *</Label>
              <Input
                value={recallReason}
                onChange={(e) => setRecallReason(e.target.value)}
                placeholder="Ví dụ: Nhiễm Salmonella, dị ứng không khai báo..."
              />
            </div>

            <div className="space-y-2">
              <Label>Mô tả mối nguy *</Label>
              <Textarea
                value={hazardDescription}
                onChange={(e) => setHazardDescription(e.target.value)}
                placeholder="Mô tả chi tiết về mối nguy hiểm đối với sức khỏe người tiêu dùng..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Mô tả sản phẩm</Label>
              <Input
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Tên sản phẩm, quy cách đóng gói..."
              />
            </div>

            <div className="space-y-2">
              <Label>Mã lô bị ảnh hưởng * (phân cách bằng dấu phẩy)</Label>
              <Textarea
                value={affectedLotCodes}
                onChange={(e) => setAffectedLotCodes(e.target.value)}
                placeholder="LOT-001, LOT-002, LOT-003"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Khu vực phân phối</Label>
              <Input
                value={distributionPattern}
                onChange={(e) => setDistributionPattern(e.target.value)}
                placeholder="Các tỉnh/thành phố hoặc quốc gia..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="publicNotification"
                checked={publicNotification}
                onChange={(e) => setPublicNotification(e.target.checked)}
                className="size-4"
              />
              <Label htmlFor="publicNotification" className="cursor-pointer">
                Yêu cầu thông báo công khai
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInitiateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleInitiateRecall} disabled={actionLoading}>
              {actionLoading ? "Đang xử lý..." : "Khởi tạo Thu hồi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
