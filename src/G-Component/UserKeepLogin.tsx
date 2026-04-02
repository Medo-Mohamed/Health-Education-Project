import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { useEffect } from "react";
import { RefreshUser } from "../M/Redux-Store/UserControle/UserDisplatSlice";

function UserKeepLogin() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(RefreshUser());
  }, [dispatch]);

  return <></>;
}

export default UserKeepLogin;
