import imgCaloc from "@/imports/caloc.jpg"
import imgGata from "@/imports/gata.webp"
import imgBanhCanh from "@/imports/banh_canh.png"
import imgLl from "@/imports/ll.jpg"
import imgComsuon from "@/imports/comsuon.jpg"
import imgBoll from "@/imports/boll-1.jpg"
import imgMc from "@/imports/m_c.jpg"
import imgLauga from "@/imports/lauga.jpg"
import imgSuonuog from "@/imports/suonuog.jpg"
import imgGoi from "@/imports/goi.jpg"
import imgComchien from "@/imports/comchien.jpg"
import imgOc from "@/imports/oc.jpeg"
import imgChagio from "@/imports/chagio.jpg"
import imgBt from "@/imports/bt.jpg"
import imgChe from "@/imports/che.jpg"
import imgFlan from "@/imports/flan.jpg"
import imgFr from "@/imports/fr.jpg"
import imgSs from "@/imports/ss.jpg"
import { A } from "@/config/assets"

export type Dish = {
  image: string
  name: string
  price: string
  group: "Món ăn" | "Tráng miệng"
  category: string
  description?: string
}

export const dishes: Dish[] = [
  { image: imgCaloc, name: "Cá lóc nướng muối ớt", price: "185.000 VNĐ", group: "Món ăn", category: "Đặc sản địa phương", description: "Cá lóc nướng thơm lừng, da giòn nhẹ và thấm vị muối ớt cay mặn đặc trưng." },
  { image: `${A}122ab.png`, name: "Mâm cơm Cây Phượng", price: "320.000 VNĐ", group: "Món ăn", category: "Món ăn gia đình", description: "Mâm cơm đầy đặn với những món nhà thân quen, thích hợp để cả gia đình cùng quây quần." },
  { image: imgGata, name: "Gà ta nướng lu", price: "245.000 VNĐ", group: "Món ăn", category: "Món nướng", description: "Gà ta nướng chậm trong lu, giữ phần thịt mềm ngọt và lớp da vàng thơm hấp dẫn." },
  { image: imgBanhCanh, name: "Bánh canh Trảng Bàng", price: "65.000 VNĐ", group: "Món ăn", category: "Đặc sản Tây Ninh", description: "Sợi bánh mềm dai hòa cùng nước dùng thanh ngọt và rau sống đặc trưng Tây Ninh." },
  { image: imgLl, name: "Bò cuốn lá lốt", price: "125.000 VNĐ", group: "Món ăn", category: "Món nướng", description: "Thịt bò mềm ngọt cuốn lá lốt thơm nồng, nướng vừa chín và dùng cùng rau tươi." },
  { image: imgComsuon, name: "Cơm tấm sườn nướng", price: "65.000 VNĐ", group: "Món ăn", category: "Món cơm", description: "Sườn nướng đậm vị dùng cùng cơm tấm nóng, đồ chua và nước mắm pha hài hòa." },
  { image: imgBoll,     name: "Bò lúc lắc khoai tây",            price: "145.000 VNĐ", group: "Món ăn",      category: "Món chính" },
  { image: imgMc,       name: "Mực chiên nước mắm",              price: "165.000 VNĐ", group: "Món ăn",      category: "Hải sản" },
  { image: imgLauga,    name: "Lẩu gà lá é",                     price: "285.000 VNĐ", group: "Món ăn",      category: "Món lẩu" },
  { image: imgSuonuog,  name: "Sườn nướng mật ong",              price: "175.000 VNĐ", group: "Món ăn",      category: "Món nướng" },
  { image: imgGoi,      name: "Gỏi ngó sen tôm thịt",            price: "125.000 VNĐ", group: "Món ăn",      category: "Khai vị" },
  { image: imgComchien, name: "Cơm chiên hải sản",               price: "95.000 VNĐ",  group: "Món ăn",      category: "Món cơm" },
  { image: imgOc,       name: "Ốc núi hấp sả",                   price: "155.000 VNĐ", group: "Món ăn",      category: "Đặc sản Tây Ninh" },
  { image: imgChagio,   name: "Chả giò Cây Phượng",              price: "95.000 VNĐ",  group: "Món ăn",      category: "Khai vị" },
  { image: imgBt,       name: "Rau rừng bánh tráng phơi sương",  price: "135.000 VNĐ", group: "Món ăn",      category: "Đặc sản Tây Ninh" },
  { image: `${A}f009a.png`, name: "Hamburger bò phô mai",        price: "75.000 VNĐ",  group: "Món ăn",      category: "Món ăn nhẹ" },
  { image: imgChe,      name: "Chè hạt sen long nhãn",           price: "45.000 VNĐ",  group: "Tráng miệng", category: "Tráng miệng" },
  { image: imgFlan,     name: "Bánh flan caramel",               price: "35.000 VNĐ",  group: "Tráng miệng", category: "Tráng miệng" },
  { image: imgFr,       name: "Trái cây theo mùa",               price: "65.000 VNĐ",  group: "Tráng miệng", category: "Tráng miệng" },
  { image: imgSs,       name: "Sữa chua nếp cẩm",                price: "42.000 VNĐ",  group: "Tráng miệng", category: "Tráng miệng" },
]

