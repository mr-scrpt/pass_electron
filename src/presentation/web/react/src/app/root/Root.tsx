import { RootProvider } from "../provider/root.provider";
import "../setup";

import { Outlet } from "react-router";

export default function Root() {
  return (
    <RootProvider>
      <Outlet />
    </RootProvider>
  );
}
