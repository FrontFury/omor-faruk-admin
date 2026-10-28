import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import AllUsers from "../pages/Users/AllUsers";
import AddEducation from "../pages/Education/AddEducation";
import AllEducation from "../pages/Education/AllEducation";
import AddExperience from "../pages/Experience/AddExperience";
import AllExperience from "../pages/Experience/AllExperience";
import AddPublications from "../pages/Publications/AddPublications";
import AllPublications from "../pages/Publications/AllPublications";
import AddExpertise from "../pages/Expertise/AddExpertise";
import AllExpertise from "../pages/Expertise/AllExpertise";
import AddBooks from "../pages/Books/AddBooks";
import AllBooks from "../pages/Books/AllBooks";
import AddActivities from "../pages/Activities/AddActivities";
import AllActivities from "../pages/Activities/AllActivities";
import AddHonor from "../pages/Honors/AddHonors";
import AllHonor from "../pages/Honors/AllHonors";
import AddGallery from "../pages/Gallery/AddGallery";
import AllGallery from "../pages/Gallery/AllGallery";
import AddReferences from "../pages/References/AddReferences";
import AllReferences from "../pages/References/AllReferences";







export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/all-users" replace />,
          },
          {
            path: "admin/all-users",
            element: <AllUsers />,
          },
          {
            path: "education/add", 
            element: <AddEducation/>
          },
          {
            path: "education/all", 
            element: <AllEducation/>
          },
          {
            path: "/experience/add", 
            element: <AddExperience/>
          },
          {
            path: "/experience/all", 
            element: <AllExperience/>
          },
          {
            path: "/publications/add", 
            element: <AddPublications />
          },
          {
            path: "/publications/all", 
            element: <AllPublications/>
          },
          {
            path: "/expertise/add", 
            element: <AddExpertise/>
          },
          {
            path: "/expertise/all", 
            element: <AllExpertise/>
          },
          {
            path: "/books/add", 
            element: <AddBooks/>
          },
          {
            path: "/books/all", 
            element: <AllBooks/>
          },
          {
            path: "/activities/add", 
            element: <AddActivities/>
          },
          {
            path: "/activities/all", 
            element: <AllActivities/>
          },
          {
            path: "/honor/add", 
            element: <AddHonor/>
          },
          {
            path: "/honor/all", 
            element: <AllHonor/>
          },
          {
            path: "/gallery/add", 
            element: <AddGallery/>
          },
          {
            path: "/gallery/all", 
            element: <AllGallery/>
          },
          {
            path: "/referees/add", 
            element: <AddReferences/>
          },
          {
            path: "/referees/all", 
            element: <AllReferences/>
          },
        ],
      },
    ],
  },
]);