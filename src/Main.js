import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./components/App";
import HomePage from "./pages/HomePage";
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
          <Route path="markets">
            <Route index element={<MarketListPage />} />
            <Route path=":marketSlug" element={<MarketPage />} />
          </Route>
          <Route path="communitys">
            <Route index element={<CommunityListPage />} />
            <Route path=":communityId" element={<CommunityPage />} />
          </Route>
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Main;
