import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./components/App";
import {
  FullLayout,
  LandingLayout,
  MyPageLayout,
  UserLayout,
} from "./components/Layout";
import HomePage from "./pages/HomePage";
import MyPage from "./pages/MyPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserPage from "./pages/UserPage";
import SettingPage from "./pages/SettingPage";
import CreateLinkPage from "./pages/CreateLinkPage";
import EditLinkPage from "./pages/EditLinkPage";
import MarketPage from "./pages/MarketPage";
import MarketListPage from "./pages/MarketListPage";
import CommunityPage from "./pages/CommunityPage";
import CommunityListPage from "./pages/CommunityListPage";
import WishlistPage from "./pages/WishlistPage";
import NotFoundPage from "./pages/NotFoundPage";

function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />

          <Route element={<MyPageLayout />}>
            <Route path="me" element={<MyPage />} />
          </Route>

          <Route element={<FullLayout />}>
            <Route path="me/edit" element={<SettingPage />} />
            <Route path="me/links/create" element={<CreateLinkPage />} />
            <Route path="me/links/:linkId/edit" element={<EditLinkPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route path="markets">
            <Route index element={<MarketListPage />} />
            <Route path=":marketId" element={<MarketPage />} /> {/* 수정 */}
          </Route>
          <Route path="communitys">
            <Route index element={<CommunityListPage />} />
            <Route path=":communityId" element={<CommunityPage />} />
          </Route>
          <Route path="wishlist" element={<WishlistPage />} />

          <Route element={<UserLayout />}>
            <Route path=":userId" element={<UserPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Main;
