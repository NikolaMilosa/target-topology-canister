import { useContext } from "react";

// project imports
import NavContent from "./NavContent";
import { ConfigContext } from "../../../contexts/ConfigContext";
import useWindowSize from "../../../hooks/useWindowSize";
import { useMenuItems } from "../../../menu-items";
import * as actionType from "../../../store/actions";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

// assets

// -----------------------|| NAVIGATION ||-----------------------//

export default function Navigation() {
  const configContext = useContext(ConfigContext);
  const { collapseMenu, collapseLayout } = configContext.state;
  const windowSize = useWindowSize();
  const { dispatch } = configContext;
  const menuItems = useMenuItems();

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  let navClass = "dark-sidebar";

  let navContent = <NavContent navigation={menuItems} />;
  navClass = [...navClass, "pc-sidebar"];
  if (windowSize.width <= 1024 && collapseMenu) {
    navClass = [...navClass, "mob-sidebar-active"];
  } else if (collapseMenu) {
    navClass = [...navClass, "navbar-collapsed"];
  }

  let navBarClass = ["navbar-wrapper"];

  let mobileOverlay = <></>;
  if (windowSize.width <= 1024 && collapseMenu) {
    mobileOverlay = (
      <div
        className="pc-menu-overlay"
        onClick={navToggleHandler}
        aria-hidden="true"
      />
    );
  }

  let navContentDOM = <div className={navBarClass.join(" ")}>{navContent}</div>;

  return (
    <nav className={navClass.join(" ")}>
      {navContentDOM}
      {mobileOverlay}
    </nav>
  );
}
