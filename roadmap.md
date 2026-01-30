# 🧭 MERN Roadmap (Build-While-Learning)

## PHASE 0 — Foundations (you’re here)

**Goal:** Server runs, DB connected, basic auth works

- [x] Node + Express setup  
- [x] MongoDB Atlas connection  
- [x] Folder structure (`routes / controllers / models`)  
- [x] Register (bcrypt)  
- [x] Login
- [x] Auth middleware (protect routes)  
- [x] `.env` discipline (no secrets in code)  

### 📌 Checkpoint
- Can explain: *bcrypt vs JWT*  
- Can protect a route using middleware  

---

## PHASE 1 — Core Backend (Lost & Found logic)

**Goal:** Real API, real data flow

### Data models
- [x] User  
- [ ] Item (lost / found)  
- [ ] Claim (who claimed what)  

### API routes
- [ ] Create item  
- [ ] Get items (filter: lost/found)  
- [ ] Update status (admin only)  
- [ ] Claim item (user → admin approval)  

### Concepts learned
- REST design  
- Role-based access  
- Data relationships in MongoDB  

### 📌 Checkpoint
- Postman tests all endpoints  
- No frontend yet  

---

## PHASE 2 — Integrations (what your doc emphasizes)

**Goal:** External services + async thinking

- [ ] Image upload (Cloudinary / S3)  
- [ ] Email notification (SendGrid)  
- [ ] Matching logic (lost ↔ found)  
- [ ] Error handling middleware  

### 📌 Checkpoint
- Item image stored externally  
- Email fires on match  

---

## PHASE 3 — Frontend (React, intentionally delayed)

**Goal:** Consume your API cleanly

- [ ] React + Vite setup  
- [ ] Axios service layer  
- [ ] Auth context (store JWT)  
- [ ] Protected routes  
- [ ] Forms (create item, login)  

### 📌 Checkpoint
- No Axios inside components  
- Auth survives page refresh  

---

## PHASE 4 — UX + Admin

**Goal:** Separation of concerns

- [ ] Admin dashboard  
- [ ] User dashboard  
- [ ] Role-based UI rendering  
- [ ] Loading / error states  

### 📌 Checkpoint
- Admin ≠ User permissions enforced in backend  

---

## PHASE 5 — Deployment & Polish

**Goal:** Real-world readiness

- [ ] Environment-based config  
- [ ] Backend deployment (Render)  
- [ ] MongoDB Atlas prod  
- [ ] Frontend build + deploy  
- [ ] README + API docs  

### 📌 Checkpoint
- Public URL works  
- No secrets exposed  

---

## 🔑 Mental Rules (important)

- Backend first, always  
- One working endpoint > 5 folders  
- If confused: **trace the request**  
- JWT = identity proof, not data storage  
- Express feels hard now → easier later  

---

## Your next immediate task

**Do ONE of these today:**

1. Finish `protect` middleware and test it  
2. Create `Item` model  
3. Protect a test route using JWT  

Reply with **which one you’re doing**, and guidance will stay scoped to that step only.
