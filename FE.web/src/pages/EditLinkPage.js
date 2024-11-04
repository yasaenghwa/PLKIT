import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../lib/axios";
import Label from "../components/Label";
import Input from "../components/Input";
import LogButton from "../components/LogButton";
import styles from "./EditLinkPage.module.css";
import { useAuth } from "../contexts/AuthProvider";
import "../axiosConfig"; // axios 설정 파일을 import하여 인터셉터 설정 적용
function EditLinkPage() {
  const [values, setValues] = useState({
    title: "",
    url: "",
  });
  const params = useParams();
  const linkId = params.id;
  const navigate = useNavigate();
  useAuth(true);

  async function getLink() {
    try {
      const res = await axios.get(`users/me/links${params.linkId}`);
      const { title, url } = res.data;
      setValues({ title, url });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("404 에러 무시: 요청한 리소스를 찾을 수 없습니다.");
        return null; // 404 에러 무시하고 null 반환
      } else {
        throw error; // 다른 에러는 그대로 throw하여 화면에 표시
      }
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    try {
      e.preventDefault();
      const { title, url } = values;
      await axios.patch(`users/me/links`, { title, url });
      navigate("/me");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("404 에러 무시: 요청한 리소스를 찾을 수 없습니다.");
        return null; // 404 에러 무시하고 null 반환
      } else {
        throw error; // 다른 에러는 그대로 throw하여 화면에 표시
      }
    }
  }

  useEffect(() => {
    getLink(linkId);
  }, [linkId]);

  return (
    <>
      <h1 className={styles.Heading}>링크 편집</h1>
      <form className={styles.Form} onSubmit={handleSubmit}>
        <Label className={styles.Label} htmlFor="title">
          사이트 이름
        </Label>
        <Input
          id="title"
          className={styles.Input}
          name="title"
          type="text"
          placeholder="사이트 이름"
          value={values.title}
          onChange={handleChange}
        />
        <Label className={styles.Label} htmlFor="url">
          링크
        </Label>
        <Input
          id="url"
          className={styles.Input}
          name="url"
          type="text"
          placeholder="https://www.example.com"
          value={values.url}
          onChange={handleChange}
        />
        <LogButton className={styles.LogButton}>적용하기</LogButton>
      </form>
    </>
  );
}

export default EditLinkPage;
