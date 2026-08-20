# Bo khung Trello hoan chinh cho do an Smart Travel

Tai lieu nay duoc thiet ke de dung truc tiep cho nhom theo dung contract: moi task co 1 owner chinh, co backup, co Definition of Done, co deadline noi bo, va duoc cap nhat trang thai hang ngay.

## 1. Cau truc bang Trello

Tao 8 list theo thu tu sau:

1. Inbox
2. Backlog
3. This Week
4. In Progress
5. Blocked
6. Review
7. Done
8. Meeting Log

## 2. Y nghia tung list

### 1. Inbox
Noi chua y tuong moi, yeu cau moi, bug moi, tai lieu can bo sung. Khong lam viec truc tiep o day qua 24h.

### 2. Backlog
Danh sach task da duoc xac nhan la can lam, nhung chua duoc dua vao sprint tuan hien tai.

### 3. This Week
Tat ca task cam ket thuc hien trong tuan. Moi task trong list nay phai co owner, backup, deadline noi bo va DoD.

### 4. In Progress
Task dang duoc thuc hien. Moi thanh vien khong nen giu qua 2 task code chinh cung luc.

### 5. Blocked
Task bi tac vi thieu du lieu, thieu quyet dinh, gap loi ky thuat, hoac phu thuoc task khac. Khi chuyen vao day phai comment ro ly do va tag nguoi lien quan.

### 6. Review
Task da xong phan thuc hien, dang cho review code, review tai lieu, review slide, hoac review logic.

### 7. Done
Task da dat DoD, da duoc review, va co artifact ro rang.

### 8. Meeting Log
Moi buoi hop tao 1 card tong hop: ngay hop, noi dung, quyet dinh, task moi, deadline moi, blocker moi.

## 3. Nhan va quy uoc can dung

### Labels theo loai cong viec
- Analysis
- Algorithm
- UI/UX
- Frontend
- Backend
- DevOps
- Testing
- Docs
- Presentation
- Management

### Labels theo muc do uu tien
- P0 Critical
- P1 High
- P2 Medium
- P3 Low

### Labels theo trang thai rui ro
- Need Decision
- Need Data
- Need Review
- External Dependency

## 4. Mau card Trello chuan

Copy template nay cho moi task:

```md
Title: [Loai task] Mo ta ngan gon

Muc tieu:
- Task nay giai quyet van de gi?

Owner:
- Ten nguoi chiu trach nhiem chinh

Backup:
- Ten nguoi ho tro khi can

Loai cong viec:
- Analysis / Algorithm / UIUX / Frontend / Backend / DevOps / Testing / Docs / Presentation / Management

Phu thuoc:
- Task nao can xong truoc?

Input:
- Tai lieu, du lieu, API, mockup, hoac quyet dinh can co truoc khi lam

Output bat buoc:
- San pham cu the phai nop ra sau khi xong task

Definition of Done:
- Dieu kien nao thi task moi duoc chuyen sang Done

Deadline noi bo:
- dd/mm/yyyy hh:mm

Checklist thuc hien:
- [ ] Buoc 1
- [ ] Buoc 2
- [ ] Buoc 3

Cach bao cao tien do:
- Update trang thai truoc 23:00 moi ngay
- Neu bi block qua 8 gio phai bao

Link lien quan:
- Github PR
- Tai lieu Drive
- Figma
- Dataset
```

## 5. Mau card cho tung loai task

### A. Mau card Analysis

```md
Title: [Analysis] Chot input output va scope de tai

Muc tieu:
- Xac dinh ro bai toan, nguoi dung muc tieu, input, output, rang buoc

Owner:
- Phuoc

Backup:
- Bao

Output bat buoc:
- 1 file scope summary
- 1 danh sach input output
- 1 danh sach out of scope

Definition of Done:
- Co mo ta bai toan ro rang
- Co user scenario cu the
- Co input va output dung format
- Co out of scope de tranh om qua rong
- Ca nhom da review va thong nhat
```

### B. Mau card Algorithm

```md
Title: [Algorithm] Thiet ke luong goi y va pseudocode

Muc tieu:
- Xay dung logic xu ly chinh cua he thong

Owner:
- Nguyen

Backup:
- Chinh

Output bat buoc:
- 1 luu do
- 1 pseudocode
- 1 mo ta tieu chi xep hang/goi y

Definition of Done:
- Logic thong tu input den output
- Co tieu chi loc va xep hang ro rang
- Co giai thich thanh phan AI duoc dung de lam gi
- Duoc Phuoc va Bao review bang van ban
```

### C. Mau card UI/UX

```md
Title: [UIUX] Wireframe va user flow ban dau

Muc tieu:
- Chot cach nguoi dung nhap du lieu va xem ket qua

Owner:
- Duy

Backup:
- Hoang

Output bat buoc:
- 1 user flow
- 1 bo wireframe man hinh chinh
- 1 guideline mau sac va component

Definition of Done:
- Co it nhat man hinh Home, Form input, Ket qua
- Luong nguoi dung khong bi dut doan
- Frontend xac nhan implement duoc
- Nhom truong duyet
```

### D. Mau card Frontend

```md
Title: [Frontend] Implement man hinh nhap thong tin nguoi dung

Muc tieu:
- Tao giao dien nhap lieu va hien thi ket qua prototype

Owner:
- Hoang hoac Minh

Backup:
- Nguoi frontend con lai

Output bat buoc:
- Ma nguon giao dien
- Screenshot hoac video ngan
- Huong dan chay

Definition of Done:
- Chay duoc tren may nhom
- Nhap duoc du lieu hop le
- Hien thi duoc ket qua hoac message loi
- Da duoc review UI va test co ban
```

### E. Mau card Backend

```md
Title: [Backend] Xay module recommendation

Muc tieu:
- Xu ly input va tra output recommendation

Owner:
- Nguyen hoac Thinh

Backup:
- Nguoi backend con lai

Output bat buoc:
- Module xu ly hoac API
- File du lieu mau
- Huong dan input output

Definition of Done:
- Chay duoc voi bo du lieu mau
- Co 3 test case co ket qua hop ly
- Co docstring/comment co ban
- Frontend goi thu thanh cong hoac co mock data tuong duong
```

### F. Mau card DevOps

```md
Title: [DevOps] Khoi tao repo structure va quy trinh PR

Muc tieu:
- Dam bao nhom lam viec nhat quan va giam loi tich hop

Owner:
- Chinh

Backup:
- Nguyen

Output bat buoc:
- Cau truc repo
- README huong dan chay
- Nhanh branch convention
- PR checklist

Definition of Done:
- Moi thanh vien clone va chay duoc project skeleton
- Co README o muc dung duoc
- Co pull request mau
- Nhom da thong nhat workflow Github
```

### G. Mau card Testing

```md
Title: [Testing] Lap test case cho recommendation flow

Muc tieu:
- Kiem tra prototype bang cac tinh huong dai dien

Owner:
- Bao

Backup:
- Minh

Output bat buoc:
- Bang test case
- Ket qua pass fail
- Danh sach bug/issue

Definition of Done:
- Co test case normal, edge, invalid input
- Co bang ket qua ro rang
- Co de xuat cai tien sau test
- Bug quan trong da duoc assign
```

### H. Mau card Docs

```md
Title: [Docs] Viet muc phan ra va tru tuong hoa trong bao cao

Muc tieu:
- Hoan thien noi dung hoc thuat theo rubric

Owner:
- Bao

Backup:
- Phuoc

Output bat buoc:
- Noi dung viet hoan chinh
- Hinh ve, luu do, bang bieu kem theo
- Nguon tham khao

Definition of Done:
- Dung scope da chot
- Viet ro, khong copy may moc
- Co trich dan/nguon neu can
- Duoc owner ky thuat xac nhan dung logic
```

### I. Mau card Presentation

```md
Title: [Presentation] Chuan bi slide va script demo

Muc tieu:
- San sang cho buoi bao cao cuoi ky

Owner:
- Phuoc

Backup:
- Bao

Output bat buoc:
- Slide final
- Script demo
- Phan chia nguoi noi

Definition of Done:
- Slide gon, ro, dung cau truc
- Demo theo kich ban 3-5 phut khong vo
- Moi thanh vien biet phan cua minh
- Co buoi tap thu it nhat 2 lan
```

## 6. Definition of Done tong quat cho ca nhom

Mot task chi duoc dua vao Done khi thoa tat ca dieu kien sau:

- Co 1 owner chinh ro rang
- Co output cu the da nop
- Da duoc review boi it nhat 1 nguoi phu hop
- Da comment ket qua tren card Trello
- Neu la code thi da chay duoc truoc khi commit
- Neu la tai lieu thi dung format thong nhat
- Neu la task lon thi da cap nhat vao nhat ky nhom

## 7. Quy trinh giao va theo doi task

1. Nhom truong tao card sau buoi hop thu Hai.
2. Owner react/comment xac nhan da nhan task.
3. Moi ngay cap nhat trang thai truoc 23:00.
4. Neu block qua 8 gio, comment vao card va tag backup.
5. Neu qua 12 gio van block, tag nhom truong de xu ly.
6. Chi chuyen sang Review khi da dat checklist ky thuat.
7. Chi chuyen sang Done khi dat DoD.

## 8. Checklist cho buoi hop hang tuan

Tao 1 card o list Meeting Log voi template sau:

```md
Title: Meeting Week X - dd/mm/yyyy

Noi dung da bao cao:
- Nguoi 1:
- Nguoi 2:
- Nguoi 3:
- Nguoi 4:
- Nguoi 5:
- Nguoi 6:
- Nguoi 7:
- Nguoi 8:

Task da hoan thanh:
- 

Task bi block:
- 

Quyet dinh moi:
- 

Task giao cho tuan toi:
- 

Rui ro can theo doi:
- 
```

## 9. Muc card nen tao ngay tu dau

- [Management] Chot scope do an
- [Analysis] Xac dinh input output va user scenario
- [Analysis] Phan ra bai toan thanh module
- [Algorithm] Thiet ke flow recommendation
- [UIUX] Ve wireframe ban dau
- [DevOps] Khoi tao repo va README
- [Docs] Tao khung bao cao
- [Testing] Tao khung test case va nhat ky nhom

## 10. Nguyen tac van hanh de tranh vo ke hoach

- Khong giao task mo ho
- Khong giao task ma khong co output ro rang
- Khong de 1 nguoi vua owner qua nhieu task P0 trong cung 1 tuan
- Moi task lon phai tach thanh task 1-2 ngay de de kiem soat
- Moi deadline noi bo nen som hon deadline mon hoc it nhat 1-2 ngay
