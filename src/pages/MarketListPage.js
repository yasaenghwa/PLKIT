import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ListPage from "../components/ListPage";
import Warn from "../components/Warn";
import MarketItem from "../components/MarketItem";
import { getMarkets, addMarket } from "../api"; // addMarket 함수 추가
import styles from "./MarketListPage.module.css";
import searchBarStyles from "../components/SearchBar.module.css";
import searchIcon from "../assets/search.svg";
import { useAuth } from "../contexts/AuthProvider"; // 사용자 인증 정보 가져오기

function MarketListPage() {
  const [searchParam, setSearchParam] = useSearchParams();
  const initKeyword = searchParam.get("keyword");
  const [keyword, setKeyword] = useState(initKeyword || "");
  const [markets, setMarkets] = useState([]);

  // 추가: 게시물 등록을 위한 상태들
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [crop, setCrop] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [farmName, setFarmName] = useState("");
  const [cultivationPeriod, setCultivationPeriod] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [image, setImage] = useState(null);
  const [tagInput, setTagInput] = useState("");

  const { user } = useAuth(); // 로그인한 사용자 정보

  useEffect(() => {
    const storedMarkets = JSON.parse(localStorage.getItem("markets")) || [];
    const filteredMarkets = initKeyword
      ? storedMarkets.filter((market) =>
          market.title.toLowerCase().includes(initKeyword.toLowerCase())
        )
      : storedMarkets;
    setMarkets(filteredMarkets);
  }, [initKeyword]);

  const handleKeywordChange = (e) => setKeyword(e.target.value);
  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParam(keyword ? { keyword } : {});
  };

  // 해시태그 입력 처리
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === " " && tagInput.trim() !== "") {
      if (hashtags.length < 3) {
        setHashtags([...hashtags, tagInput.trim()]);
        setTagInput("");
      } else {
        alert("해시태그는 최대 3개까지 입력 가능합니다.");
      }
    }
  };

  const handleTagDelete = (tagToDelete) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToDelete));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  // 게시물 등록 처리
  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("게시글을 작성하려면 로그인이 필요합니다.");
      return;
    }

    // 필수 필드 확인
    if (!title || !content || !crop || !price) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    try {
      const newMarket = await addMarket({
        title,
        content,
        crop,
        price,
        location,
        farmName,
        cultivationPeriod,
        hashtags,
        image,
        writer: {
          id: user.id,
          name: user.name,
          profile: {
            photo: user.avatar || "default_avatar.svg",
          },
        },
      });

      if (newMarket) {
        setMarkets((prevMarkets) => [newMarket, ...prevMarkets]);
        // 폼 초기화
        setTitle("");
        setContent("");
        setCrop("");
        setPrice("");
        setLocation("");
        setFarmName("");
        setCultivationPeriod("");
        setHashtags([]);
        setImage(null);
        setTagInput("");
      } else {
        console.warn("중복된 게시물이 발견되어 추가되지 않았습니다.");
      }
    } catch (error) {
      console.error("게시물 작성 중 오류가 발생했습니다:", error);
      alert("게시물 작성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <ListPage
      variant="catalog"
      title="스마트팜 데이터 목록"
      description="안전한 농업 데이터 거래를 경험해보세요."
    >
      <form className={searchBarStyles.form} onSubmit={handleSubmit}>
        <input
          name="keyword"
          value={keyword}
          onChange={handleKeywordChange}
          placeholder="검색으로 데이터 찾기"
        />
        <button type="submit">
          <img src={searchIcon} alt="검색" />
        </button>
      </form>

      {/* 게시물 등록 폼 */}
      {user ? (
        <form className={styles.newPostForm} onSubmit={handlePostSubmit}>
          {/* 이미지 업로드 */}
          <div className={styles.imageUpload}>
            {image ? (
              <img src={image} alt="미리보기" className={styles.previewImage} />
            ) : (
              <div className={styles.imagePlaceholder}>이미지 미리보기</div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {/* 입력 필드들 */}
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={title}
              placeholder="제목"
              onChange={(e) => setTitle(e.target.value)}
              className={styles.inputField}
            />
            <textarea
              value={content}
              placeholder="설명"
              onChange={(e) => setContent(e.target.value)}
              className={styles.inputField}
            />
            <input
              type="text"
              value={crop}
              placeholder="재배 작물"
              onChange={(e) => setCrop(e.target.value)}
              className={styles.inputField}
            />
            <input
              type="number"
              value={price}
              placeholder="가격 (씨앗)"
              onChange={(e) => setPrice(e.target.value)}
              className={styles.inputField}
            />
            {/* 추가 필드들 */}
            <input
              type="text"
              value={location}
              placeholder="생산지"
              onChange={(e) => setLocation(e.target.value)}
              className={styles.inputField}
            />
            <input
              type="text"
              value={farmName}
              placeholder="농장 이름"
              onChange={(e) => setFarmName(e.target.value)}
              className={styles.inputField}
            />
            <input
              type="text"
              value={cultivationPeriod}
              placeholder="재배 기간"
              onChange={(e) => setCultivationPeriod(e.target.value)}
              className={styles.inputField}
            />
            {/* 해시태그 입력 */}
            <div className={styles.hashtagContainer}>
              {hashtags.map((tag, index) => (
                <div key={index} className={styles.hashtag}>
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleTagDelete(tag)}
                    className={styles.deleteTagButton}
                  >
                    x
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={tagInput}
                placeholder="해시태그 입력 (최대 3개)"
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                className={styles.inputField}
              />
            </div>
          </div>
          {/* 게시물 등록 버튼 */}
          <button type="submit" className={styles.submitButton}>
            확인
          </button>
        </form>
      ) : (
        <p>게시물을 등록하려면 로그인이 필요합니다.</p>
      )}

      <p className={styles.count}>총 {markets.length}개 데이터</p>

      {initKeyword && markets.length === 0 ? (
        <Warn
          className={styles.emptyList}
          title="조건에 맞는 데이터가 없어요."
          description="올바른 검색어가 맞는지 다시 한 번 확인해 주세요."
        />
      ) : (
        <div className={styles.marketList}>
          {markets.map((market) => (
            <MarketItem key={market.id} market={market} />
          ))}
        </div>
      )}
    </ListPage>
  );
}

export default MarketListPage;
