# Omar Faruk Admin

Admin dashboard built with React, Vite, Tailwind CSS, Firebase Authentication, and React Router.

## Requirements

- Node.js 20.19+ (or 22.12+)
- npm

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a `.env` file in the project root with the Firebase web app settings and ImgBB API key:

   ```env
   VITE_apiKey=
   VITE_authDomain=
   VITE_projectId=
   VITE_storageBucket=
   VITE_messagingSenderId=
   VITE_appId=
   VITE_image_host_key=
   ```

   Fill in the values from your Firebase project and ImgBB account. Keep `.env` private; it is excluded from Git.

3. Start the development server:

   ```sh
   npm run dev
   ```

   In Windows PowerShell, if script execution blocks `npm`, use the Windows command shim:

   ```powershell
   npm.cmd run dev
   ```

## Checks

```sh
npm run lint
npm run build
```

In PowerShell, use `npm.cmd run lint` and `npm.cmd run build` if `npm` is blocked by the execution policy.
