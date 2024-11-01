import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import Label from "../components/Label";
import Input from "../components/Input";
import LogButton from "../components/LogButton";
import TextArea from "../components/TextArea";
import AvatarInput from "../components/AvatarInput";
import styles from "./SettingPage.module.css";
import { useAuth } from "../contexts/AuthProvider";

function SettingPage() {
  const [initialAvatar, setInitialAvatar] = useState("");
  const [values, setValues] = useState({
    avatar: "",
    name: "",
    email: "",
    bio: "",
  });
  const navigate = useNavigate();
  const { user, updateMe } = useAuth(true);

  function handleChange(name, value) {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    handleChange(name, value);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = {};
    if (values.name) formData.name = values.name;
    if (values.avatar) formData.avatar = values.avatar;
    if (values.email) formData.email = values.email;
    if (values.bio) formData.bio = values.bio;

    await updateMe(formData); // 업데이트 후 getMe 호출 포함됨
    navigate("/me");
  }

  useEffect(() => {
    const { avatar, name, email, bio } = user;
    setValues({
      name,
      email,
      bio,
    });
    setInitialAvatar(avatar);
  }, [user]);

  return (
    <>
      <h1 className={styles.Heading}>프로필 편집</h1>
      <form className={styles.Form} onSubmit={handleSubmit}>
        <AvatarInput
          name="avatar"
          initialAvatar={initialAvatar}
          className={styles.Input}
          onChange={handleChange}
        />
        <Label className={styles.Label} htmlFor="name">
          이름
        </Label>
        <Input
          id="name"
          className={styles.Input}
          name="name"
          type="text"
          placeholder="이름"
          value={values.name}
          onChange={handleInputChange}
        />
        <Label className={styles.Label} htmlFor="email">
          이메일
        </Label>
        <Input
          id="email"
          className={styles.Input}
          name="email"
          type="email"
          placeholder="이메일"
          value={values.email}
          onChange={handleInputChange}
        />
        <Label className={styles.Label} htmlFor="bio">
          내 링크 소개
        </Label>
        <TextArea
          id="bio"
          className={styles.TextArea}
          name="bio"
          type="text"
          maxLength={64}
          placeholder="아래에 등록한 사이트들과 자신에 대해 간단하게 소개하는 설명을 작성해 주세요!"
          value={values.bio}
          onChange={handleInputChange}
        />
        <LogButton className={styles.LogButton}>적용하기</LogButton>
      </form>
    </>
  );
}

export default SettingPage;
