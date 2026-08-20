# Ban phan cong chi tiet theo tung tuan cho 8 thanh vien

Tai lieu nay de xuat ke hoach cho nhom 8 nguoi theo huong an toan, de dat diem cao va phu hop rubric. De co the chia task cu the, scope duoc chot o muc vua du:

## Scope de xuat

Xay dung prototype Smart Travel Assistant tap trung vao 1 bai toan chinh:

"He thong goi y diem an uong va diem tham quan co ban theo so thich, ngan sach va vi tri, kem luong goi y lich trinh ngan."

Ly do chon scope nay:
- Du nho de hoan thanh trong khuon kho do an
- De the hien day du cac buoc cua tu duy tinh toan
- Co the dung Python + du lieu mau + API o muc vua phai
- De chia task cho UI, frontend, backend, docs, test, devops
- Phu hop voi vi du va huong de bai da dua ra

## Nguyen tac phan cong

- Moi task co 1 owner chinh
- Moi nguoi co 1 huong chuyen sau, nhung van tham gia review va dong gop cac phan chung
- Deadline noi bo dat som hon du kien cua mon hoc de tranh don viec vao cuoi ky
- Moi dau ra phai dung duoc cho bao cao, slide, demo hoac nhat ky nhom

## Vai tro thuc thi

| Thanh vien | Vai tro van hanh | Truong trach chinh | Backup |
|---|---|---|---|
| Nguyen Van Phuoc | Team Lead / Product Owner | Scope, backlog, review tong, bao cao tong hop, thuyet trinh | Bao |
| Nguyen Quoc Bao | Doc & QA Lead | Nhat ky nhom, test plan, test report, report format, slide support | Phuoc |
| Nguyen Trung Chinh | DevOps Lead | Repo, workflow Github, integration, release checklist | Nguyen, Thinh |
| Pham Xuan Duy | UI/UX Lead | User flow, wireframe, mockup, guideline giao dien | Hoang |
| Nguyen Minh Hoang | Frontend Lead | Form input, ket qua recommendation, ket noi backend | Minh |
| Nguyen Huu Duy Minh | Frontend Support / QA UI | Component, responsive, test UI, polish giao dien | Duy |
| Nguyen Van Nguyen | Backend Lead | Data model, recommendation logic, API/module xu ly | Chinh |
| Do Duc Thinh | Backend Support / Data | Dataset, API ngoai, cleaning data, service phu tro | Nguyen |

## Phan cong theo tuan

## Tuan 1: Chot de tai, scope, cach lam

### Muc tieu tuan
- Chot bai toan cu the
- Chot input/output
- Chot cong nghe du kien
- Mo repo va bo khung quan ly task

### Phan cong

#### Phuoc
- Viec chinh: Dieu phoi buoi hop khoi dong, chot scope tam thoi, tao backlog tong
- Deadline noi bo: Thu Tuan 1, 22:00
- Dau ra cu the:
  - 1 file scope summary
  - 1 danh sach muc tieu va out of scope
  - 1 bang phan cong vai tro chinh thuc

#### Bao
- Viec chinh: Tao khung nhat ky nhom, khung bao cao, khung bien ban hop
- Deadline noi bo: Thu Nam Tuan 1, 22:00
- Dau ra cu the:
  - 1 template nhat ky nhom
  - 1 template bien ban hop
  - 1 skeleton bao cao

#### Chinh
- Viec chinh: Tao repo Github, branch rule, README khoi tao
- Deadline noi bo: Thu Nam Tuan 1, 22:00
- Dau ra cu the:
  - Repo khoi tao
  - README ban dau
  - Huong dan branch/PR

#### Duy
- Viec chinh: Phac user flow tong quan
- Deadline noi bo: Thu Sau Tuan 1, 18:00
- Dau ra cu the:
  - 1 user flow phien ban 1
  - 1 danh sach man hinh can co

#### Hoang
- Viec chinh: De xuat stack frontend va cach to chuc man hinh
- Deadline noi bo: Thu Sau Tuan 1, 22:00
- Dau ra cu the:
  - 1 de xuat frontend stack
  - 1 draft cau truc thu muc frontend

#### Minh
- Viec chinh: Nghien cuu component can co va cach hien thi ket qua
- Deadline noi bo: Chu Nhat Tuan 1, 18:00
- Dau ra cu the:
  - 1 danh sach component UI
  - 1 de xuat trang ket qua

#### Nguyen
- Viec chinh: Phan tich bai toan recommendation va du lieu can co
- Deadline noi bo: Chu Nhat Tuan 1, 18:00
- Dau ra cu the:
  - 1 note input/output backend
  - 1 danh sach truong du lieu can co

#### Thinh
- Viec chinh: Tim nguon du lieu mau va API co the dung
- Deadline noi bo: Chu Nhat Tuan 1, 18:00
- Dau ra cu the:
  - 1 bang tong hop nguon du lieu
  - 1 de xuat dataset mau 20-50 dong

### Deliverable chung cuoi tuan
- Scope v1
- Repo v1
- Bang Trello v1
- Nhat ky nhom v1

## Tuan 2: Phan tich van de, input/output, user scenario

### Muc tieu tuan
- Chuyen scope tu muc mo sang muc ro rang
- Chot user persona, input, output, rang buoc
- Chot bo du lieu mau

### Phan cong

#### Phuoc
- Tong hop va chot phien ban scope cuoi
- Deadline: Thu Nam Tuan 2, 22:00
- Dau ra:
  - Scope final v1
  - Danh sach yeu cau chuc nang va phi chuc nang

#### Bao
- Viet muc "Phan tich van de" trong bao cao
- Deadline: Chu Nhat Tuan 2, 20:00
- Dau ra:
  - 1 muc bao cao hoan chinh cho phan problem analysis
  - 1 bang user scenario

#### Chinh
- Chuan hoa repo va tao issue/task labels
- Deadline: Thu Sau Tuan 2, 22:00
- Dau ra:
  - Cau truc repo on dinh
  - Labels va template issue/PR

#### Duy
- Ve wireframe low fidelity cho 3 man hinh chinh
- Deadline: Chu Nhat Tuan 2, 18:00
- Dau ra:
  - Home
  - Input form
  - Recommendation result

#### Hoang
- Tao skeleton giao dien ban dau
- Deadline: Chu Nhat Tuan 2, 22:00
- Dau ra:
  - Frontend skeleton chay duoc
  - Route/man hinh co ban

#### Minh
- Tao component input va layout ket qua mau
- Deadline: Chu Nhat Tuan 2, 22:00
- Dau ra:
  - Component form fields
  - Component card ket qua

#### Nguyen
- Chot schema du lieu va quy tac loc co ban
- Deadline: Thu Bay Tuan 2, 18:00
- Dau ra:
  - Data schema
  - Rule loc theo ngan sach, vi tri, so thich

#### Thinh
- Tao bo du lieu mau da clean
- Deadline: Thu Bay Tuan 2, 20:00
- Dau ra:
  - CSV/JSON du lieu mau
  - Giai thich nguon va cac cot

### Deliverable chung cuoi tuan
- Problem analysis hoan chinh
- Input/output da chot
- Wireframe v1
- Dataset v1

## Tuan 3: Phan ra va nhan dang mau

### Muc tieu tuan
- Phan tach bai toan thanh module ro rang
- Xac dinh cac pattern lap lai trong recommendation flow

### Phan cong

#### Phuoc
- Dieu phoi workshop phan ra bai toan
- Deadline: Thu Tu Tuan 3, 22:00
- Dau ra:
  - Danh sach module he thong
  - Ban do phu thuoc giua cac module

#### Bao
- Viet muc "Phan ra va nhan dang mau"
- Deadline: Chu Nhat Tuan 3, 20:00
- Dau ra:
  - Noi dung viet cho bao cao
  - Bang mapping problem -> module -> pattern

#### Chinh
- Chuan bi so do tong quan he thong o muc ky thuat
- Deadline: Chu Nhat Tuan 3, 18:00
- Dau ra:
  - System architecture sketch

#### Duy
- Toi uu user flow theo module da tach
- Deadline: Thu Bay Tuan 3, 18:00
- Dau ra:
  - User flow v2
  - Note tuong ung giua UI va module

#### Hoang
- Tach frontend thanh cac phan phu hop module
- Deadline: Chu Nhat Tuan 3, 22:00
- Dau ra:
  - Frontend module map

#### Minh
- Dinh nghia cac state giao dien va trang thai loi/rong
- Deadline: Chu Nhat Tuan 3, 22:00
- Dau ra:
  - Danh sach state UI
  - Mockup empty/loading/error

#### Nguyen
- Phan tach recommendation thanh cac buoc xu ly
- Deadline: Thu Bay Tuan 3, 20:00
- Dau ra:
  - Pipeline recommendation
  - Input/output tung buoc

#### Thinh
- Phan loai du lieu theo nhom phuc vu pipeline
- Deadline: Thu Bay Tuan 3, 20:00
- Dau ra:
  - Danh sach feature/cot du lieu theo cong dung

### Deliverable chung cuoi tuan
- So do module
- Tai lieu decomposition va pattern
- User flow v2

## Tuan 4: Tru tuong hoa va so do he thong

### Muc tieu tuan
- Chot cac thuoc tinh cot loi
- Ve so do he thong va luong du lieu

### Phan cong

#### Phuoc
- Chot danh sach core attributes can giu va thong tin bo qua
- Deadline: Thu Nam Tuan 4, 22:00
- Dau ra:
  - Bang abstraction

#### Bao
- Viet muc "Tru tuong hoa"
- Deadline: Chu Nhat Tuan 4, 20:00
- Dau ra:
  - Noi dung abstraction trong bao cao
  - Bang core vs non-core factors

#### Chinh
- Ve so do he thong va deployment don gian
- Deadline: Chu Nhat Tuan 4, 18:00
- Dau ra:
  - System diagram
  - Integration diagram

#### Duy
- Chot wireframe mid fidelity
- Deadline: Thu Bay Tuan 4, 18:00
- Dau ra:
  - Bo wireframe cap nhat
  - UI notes cho frontend

#### Hoang
- Implement layout chinh theo wireframe moi
- Deadline: Chu Nhat Tuan 4, 22:00
- Dau ra:
  - Layout update

#### Minh
- Hoan thien component card recommendation
- Deadline: Chu Nhat Tuan 4, 22:00
- Dau ra:
  - Card ket qua co thong tin ro rang

#### Nguyen
- Chot cac feature dau vao cho thuat toan
- Deadline: Thu Bay Tuan 4, 20:00
- Dau ra:
  - Feature list cuoi cho recommendation

#### Thinh
- Chuyen doi du lieu ve dung format he thong can
- Deadline: Thu Bay Tuan 4, 20:00
- Dau ra:
  - Dataset v2 ready for code

### Deliverable chung cuoi tuan
- Muc abstraction hoan chinh
- System diagram v1
- Wireframe v2
- Dataset v2

## Tuan 5: Thiet ke thuat toan, luu do, pseudocode

### Muc tieu tuan
- Dong bang thiet ke
- Chuan bi day du cho giai doan code

### Phan cong

#### Phuoc
- Review toan bo logic va duyet design freeze
- Deadline: Chu Nhat Tuan 5, 21:00
- Dau ra:
  - Bien ban design freeze

#### Bao
- Viet muc "Thiet ke va bieu dien thuat toan"
- Deadline: Chu Nhat Tuan 5, 20:00
- Dau ra:
  - Noi dung bao cao ve thuat toan
  - Anh luu do chen duoc vao bao cao

#### Chinh
- Chuan bi khung integration va env config
- Deadline: Thu Bay Tuan 5, 18:00
- Dau ra:
  - Env sample
  - Huong dan chay local

#### Duy
- Chot guideline giao dien final cho prototype
- Deadline: Thu Bay Tuan 5, 18:00
- Dau ra:
  - UI guideline final

#### Hoang
- Chot cau truc giao dien can code trong Tuan 6-7
- Deadline: Thu Bay Tuan 5, 22:00
- Dau ra:
  - Frontend implementation checklist

#### Minh
- Chot cac component va props interface
- Deadline: Thu Bay Tuan 5, 22:00
- Dau ra:
  - Component spec

#### Nguyen
- Viet pseudocode va cong thuc scoring/loc
- Deadline: Thu Bay Tuan 5, 20:00
- Dau ra:
  - Pseudocode final
  - Ranking/scoring rule

#### Thinh
- Chuan bi sample API/data loader hoac script doc du lieu
- Deadline: Thu Bay Tuan 5, 20:00
- Dau ra:
  - Data loading script
  - Mapping field tai lieu

### Deliverable chung cuoi tuan
- Pseudocode final
- Flowchart final
- Design freeze

## Tuan 6: Lap trinh prototype - dot 1

### Muc tieu tuan
- Co ban chay duoc luong nhap input -> xu ly -> hien thi ket qua

### Phan cong

#### Phuoc
- Theo doi integration va chot thu tu uu tien fix
- Deadline: Chu Nhat Tuan 6, 21:00
- Dau ra:
  - Danh sach issue uu tien

#### Bao
- Tao test case ban dau va checklist review demo
- Deadline: Chu Nhat Tuan 6, 18:00
- Dau ra:
  - Test case v1
  - Demo checklist v1

#### Chinh
- Ho tro setup moi truong, branch, merge va release nho
- Deadline: Hang ngay 23:00 update
- Dau ra:
  - Repo tich hop on dinh
  - 1 release note giua ky thuat

#### Duy
- Review UI sau khi implement dot 1
- Deadline: Chu Nhat Tuan 6, 18:00
- Dau ra:
  - UI review note
  - Danh sach chinh sua uu tien cao

#### Hoang
- Code form input va luong submit
- Deadline: Chu Nhat Tuan 6, 22:00
- Dau ra:
  - Form input chay duoc
  - Validate co ban

#### Minh
- Code trang ket qua va component card
- Deadline: Chu Nhat Tuan 6, 22:00
- Dau ra:
  - Recommendation result page
  - Loading/error state

#### Nguyen
- Code recommendation engine ban dau
- Deadline: Chu Nhat Tuan 6, 22:00
- Dau ra:
  - Module recommendation v1
  - Mau output JSON hoac object

#### Thinh
- Code bo doc du lieu va bo loc du lieu ban dau
- Deadline: Chu Nhat Tuan 6, 22:00
- Dau ra:
  - Data processing v1
  - Dataset ket noi duoc voi module xu ly

### Deliverable chung cuoi tuan
- Prototype v0.1 chay duoc tren local

## Tuan 7: Lap trinh prototype - dot 2 va tich hop

### Muc tieu tuan
- Tich hop frontend-backend
- Cai thien ket qua recommendation
- Tao ban demo co the trinh dien

### Phan cong

#### Phuoc
- Duyet phien ban prototype giua ky
- Deadline: Chu Nhat Tuan 7, 21:00
- Dau ra:
  - Bien ban review prototype

#### Bao
- Thu nghiem test user flow tren 3-5 kich ban
- Deadline: Chu Nhat Tuan 7, 18:00
- Dau ra:
  - Test result v1
  - Danh sach bug va van de logic

#### Chinh
- Tich hop he thong, fix conflict, chuan hoa cach chay
- Deadline: Chu Nhat Tuan 7, 22:00
- Dau ra:
  - Ban tich hop on dinh
  - README cap nhat

#### Duy
- Chinh UI theo review va them tinh nhat quan
- Deadline: Chu Nhat Tuan 7, 18:00
- Dau ra:
  - Mockup sau cung doi chieu voi san pham

#### Hoang
- Ket noi giao dien voi backend/module xu ly
- Deadline: Chu Nhat Tuan 7, 22:00
- Dau ra:
  - Frontend ket noi thanh cong

#### Minh
- Hoan thien responsive va xu ly edge state
- Deadline: Chu Nhat Tuan 7, 22:00
- Dau ra:
  - UI polished
  - Error/empty state on dinh

#### Nguyen
- Toi uu logic xep hang va recommendation
- Deadline: Chu Nhat Tuan 7, 22:00
- Dau ra:
  - Recommendation v2
  - Giai thich logic ket qua

#### Thinh
- Bo sung nguon du lieu, map them truong hoac API neu can
- Deadline: Chu Nhat Tuan 7, 22:00
- Dau ra:
  - Dataset v3 hoac API stub
  - Tai lieu field mapping cap nhat

### Deliverable chung cuoi tuan
- Prototype v0.2 co the demo noi bo

## Tuan 8: Kiem thu va nhan phan hoi

### Muc tieu tuan
- Kiem thu co he thong
- Tim bug va diem yeu
- Chot danh sach cai tien

### Phan cong

#### Phuoc
- Uu tien hoa bug va ra quyet dinh cat scope neu can
- Deadline: Thu Nam Tuan 8, 22:00
- Dau ra:
  - Bang uu tien bug/improvement

#### Bao
- Chu tri test chinh thuc va tong hop ket qua
- Deadline: Chu Nhat Tuan 8, 20:00
- Dau ra:
  - Test report v2
  - Bang tong hop pass/fail

#### Chinh
- Theo doi log loi, cau hinh chay demo on dinh
- Deadline: Chu Nhat Tuan 8, 22:00
- Dau ra:
  - Checklist run demo

#### Duy
- Danh gia trai nghiem nguoi dung va de xuat sua UI
- Deadline: Thu Bay Tuan 8, 18:00
- Dau ra:
  - UI issue list

#### Hoang
- Sua bug giao dien quan trong
- Deadline: Chu Nhat Tuan 8, 22:00
- Dau ra:
  - UI fixes P0/P1

#### Minh
- Kiem thu giao dien tren nhieu kich thuoc man hinh
- Deadline: Chu Nhat Tuan 8, 22:00
- Dau ra:
  - Responsive test note
  - Fix list da xu ly

#### Nguyen
- Sua bug logic recommendation
- Deadline: Chu Nhat Tuan 8, 22:00
- Dau ra:
  - Logic fixes
  - Ket qua test truoc va sau khi sua

#### Thinh
- Sua bug du lieu/API, bo sung data can thiet
- Deadline: Chu Nhat Tuan 8, 22:00
- Dau ra:
  - Data fix changelog

### Deliverable chung cuoi tuan
- Test report v2
- Bug list da duoc xu ly phan lon

## Tuan 9: Cai tien va khoa prototype

### Muc tieu tuan
- Hoan thien prototype
- Khoa pham vi tinh nang
- Chuan bi tai lieu minh chung cho bao cao

### Phan cong

#### Phuoc
- Chot release candidate
- Deadline: Chu Nhat Tuan 9, 21:00
- Dau ra:
  - Prototype release candidate

#### Bao
- Viet muc kiem thu va cai tien trong bao cao
- Deadline: Chu Nhat Tuan 9, 20:00
- Dau ra:
  - Bao cao phan test/improvement

#### Chinh
- Chot script chay demo va release note
- Deadline: Chu Nhat Tuan 9, 22:00
- Dau ra:
  - Release note
  - Runbook demo

#### Duy
- Khoa giao dien demo final
- Deadline: Thu Bay Tuan 9, 18:00
- Dau ra:
  - UI final review approved

#### Hoang
- Dong bang frontend
- Deadline: Chu Nhat Tuan 9, 22:00
- Dau ra:
  - Frontend final branch merged

#### Minh
- Don dep giao dien, text, thong bao va chi tiet nho
- Deadline: Chu Nhat Tuan 9, 22:00
- Dau ra:
  - UI polish final

#### Nguyen
- Dong bang backend/recommendation
- Deadline: Chu Nhat Tuan 9, 22:00
- Dau ra:
  - Backend final branch merged

#### Thinh
- Chot bo du lieu demo va tai lieu nguon du lieu
- Deadline: Chu Nhat Tuan 9, 22:00
- Dau ra:
  - Dataset final cho demo
  - Source note

### Deliverable chung cuoi tuan
- Prototype final cho bao cao
- Tai lieu kiem thu va cai tien

## Tuan 10: Bao cao va slide

### Muc tieu tuan
- Hoan thien bao cao va slide
- Moi nguoi co phan dong gop ro rang

### Phan cong

#### Phuoc
- Tong hop bao cao tong, viet phan mo dau, ket luan, dong gop thanh vien
- Deadline: Thu Bay Tuan 10, 20:00
- Dau ra:
  - Ban bao cao tong hop v1

#### Bao
- Chinh format, chuan hoa tai lieu, kiem tra logic trinh bay
- Deadline: Chu Nhat Tuan 10, 20:00
- Dau ra:
  - Bao cao v2 sach, thong nhat
  - Nhat ky nhom day du

#### Chinh
- Tao huong dan demo, so do kientruc dua vao slide
- Deadline: Thu Bay Tuan 10, 18:00
- Dau ra:
  - Kien truc/tech slide
  - Demo run checklist

#### Duy
- Chuan bi slide phan UI/UX va user journey
- Deadline: Thu Bay Tuan 10, 18:00
- Dau ra:
  - Slide UI/UX

#### Hoang
- Chuan bi anh/chup man hinh frontend va mo ta luong giao dien
- Deadline: Thu Bay Tuan 10, 18:00
- Dau ra:
  - Screenshot giao dien
  - Slide frontend

#### Minh
- Chuan bi minh hoa trai nghiem nguoi dung va tinh huong demo
- Deadline: Thu Bay Tuan 10, 18:00
- Dau ra:
  - Slide use case demo

#### Nguyen
- Viet phan mo ta backend, algorithm, recommendation logic vao bao cao va slide
- Deadline: Thu Bay Tuan 10, 18:00
- Dau ra:
  - Slide algorithm/backend
  - Noi dung ky thuat cho bao cao

#### Thinh
- Tong hop nguon du lieu, API, tham khao ky thuat
- Deadline: Thu Bay Tuan 10, 18:00
- Dau ra:
  - Muc references data/tech
  - Slide data source

### Deliverable chung cuoi tuan
- Bao cao v2
- Slide v1
- Nhat ky nhom hoan chinh gan day du

## Tuan 11: Tap demo va chot nop bai

### Muc tieu tuan
- Tap bao cao
- Khoa file nop
- Chuan bi phan hoi cau hoi

### Phan cong

#### Phuoc
- Dieu phoi 2 buoi tap, chot thu tu nguoi noi, chot file nop
- Deadline: Truoc ngay nop 1 ngay, 20:00
- Dau ra:
  - Slide final
  - Script thuyet trinh final
  - File nop da khoa

#### Bao
- Kiem tra file bao cao, slide, nhat ky, ten file va checklist nop bai
- Deadline: Truoc ngay nop 1 ngay, 18:00
- Dau ra:
  - Submission checklist final

#### Chinh
- Chot moi truong chay demo, backup phuong an offline
- Deadline: Truoc ngay nop 1 ngay, 18:00
- Dau ra:
  - Demo package
  - Plan B neu internet/API loi

#### Duy
- Chot phan trinh bay UI/UX, luyen noi 1-2 phut
- Deadline: Truoc ngay nop 1 ngay, 18:00
- Dau ra:
  - Script noi ngan phan UI

#### Hoang
- Luyen demo thao tac giao dien
- Deadline: Truoc ngay nop 1 ngay, 18:00
- Dau ra:
  - Demo flow truon tru

#### Minh
- Ho tro Q&A cho trai nghiem nguoi dung va ket qua hien thi
- Deadline: Truoc ngay nop 1 ngay, 18:00
- Dau ra:
  - Danh sach cau hoi UI co the gap

#### Nguyen
- Luyen giai thich logic recommendation va xu ly input/output
- Deadline: Truoc ngay nop 1 ngay, 18:00
- Dau ra:
  - Script tra loi cau hoi ky thuat

#### Thinh
- Luyen giai thich du lieu, nguon du lieu, va gioi han he thong
- Deadline: Truoc ngay nop 1 ngay, 18:00
- Dau ra:
  - Script data/API/Q&A

### Deliverable chung cuoi tuan
- GroupID.pdf
- Slide final
- Prototype final
- So nhat ky nhom
- Kich ban demo va Q&A

## Dau ra bat buoc theo nguoi trong toan du an

### Phuoc
- Scope summary
- Backlog/Trello assignment
- Bien ban design freeze
- Tong hop bao cao va slide
- Script thuyet trinh

### Bao
- Nhat ky nhom
- Problem analysis report
- Test case va test report
- Bao cao final formatting
- Submission checklist

### Chinh
- Repo structure
- README va runbook
- PR/release workflow
- Integration support
- Demo checklist

### Duy
- User flow
- Wireframe
- UI guideline
- UI review notes
- Slide UI/UX

### Hoang
- Frontend structure
- Form input
- Ket noi backend
- Screenshot/slide frontend

### Minh
- Components UI
- Trang ket qua
- Responsive va polish
- Slide use case demo

### Nguyen
- Data schema
- Recommendation logic
- Pseudocode
- Backend/algorithm explanation

### Thinh
- Dataset va source note
- Data loader/API support
- Data cleaning changelog
- Slide ve data source

## Cach van hanh de khong bi vo deadline

1. Moi toi truoc 23:00 cap nhat Trello.
2. Moi task bi tac qua 8 gio phai tag backup.
3. Moi task bi tac qua 12 gio phai tag Phuoc.
4. Khong de task o In Progress qua 3 ngay neu khong co comment ly do.
5. Moi Chu Nhat dong sprint va danh gia 3 cau hoi:
- Viec gi xong?
- Viec gi tre?
- Cat scope hay tang nguoi ho tro o dau?

## Luu y rui ro can xu ly som

- Brief mon hoc ghi nhom 5-7 nguoi, nhung nhom hien tai co 8 nguoi. Can hoi giang vien som de tranh rui ro hanh chinh.
- Khong nen chon scope qua rong nhu chatbot + vision + route optimization + dashboard cung luc.
- Bao cao va nhat ky nhom phai cap nhat song song, khong de cuoi ky moi lam.
