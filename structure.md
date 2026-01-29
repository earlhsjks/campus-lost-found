server/
├─ src/
│  ├─ config/
│  │  ├─ db.js            # MongoDB connection
│  │  ├─ cloudinary.js    # Cloud storage config
│  │  └─ mail.js          # Email/SMS config
│  │
│  ├─ models/
│  │  ├─ User.js
│  │  ├─ Item.js
│  │  └─ Claim.js
│  │
│  ├─ controllers/
│  │  ├─ auth.controller.js
│  │  ├─ item.controller.js
│  │  └─ claim.controller.js
│  │
│  ├─ routes/
│  │  ├─ auth.routes.js
│  │  ├─ item.routes.js
│  │  └─ claim.routes.js
│  │
│  ├─ middleware/
│  │  ├─ auth.middleware.js
│  │  ├─ role.middleware.js
│  │  ├─ upload.middleware.js
│  │  └─ error.middleware.js
│  │
│  ├─ services/
│  │  ├─ notification.service.js
│  │  └─ match.service.js
│  │
│  ├─ utils/
│  │  ├─ generateToken.js
│  │  └─ validators.js
│  │
│  ├─ app.js
│  └─ server.js
│
├─ .env
├─ package.json
└─ package-lock.json
