import React from "react";
import { Link, useNavigate } from "react-router-dom";
//* Redux
import { useDispatch, useSelector } from "react-redux";
import { admin } from "../../../redux/actions";
//* Styles
import styled from "styled-components";
import Variables from "../../../Styles/Variables";
import GlobalStyles from "../../../Styles/GlobalStyles";
import logo from "../../../Assets/logo.png";
//* Modal
import Modal from "react-modal";
//* Utils
import CreateBugReport from "../BugsReport/CreateBugReport";
//* Initializations
const { input } = GlobalStyles;
const { principalColor, secondaryColor } = Variables;

const ModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    backgroundColor: principalColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    padding: 0,
    overflowX: "hidden",
    width: "40%",
    height: "40%",
  },
};

function NavBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const adminState = useSelector((s) => s.admin);

  const [adminPassModal, setAdminPassModal] = React.useState(false);
  const [adminPass, setAdminPass] = React.useState("");

  const handleAdm = (e) => {
    e.preventDefault();
    if (adminPass.toLowerCase() === "CIJGIDSI") {
      navigate("/admin");
      dispatch(admin());
    }
  };

  React.useEffect(() => {
    setAdminPassModal(false);
  }, [adminState === true]);

  return (
    <NavBarContainer>
      <Container>
        <HiddenButton onDoubleClick={() => setAdminPassModal(!adminPassModal)} />
        <Logo src={logo} alt="logo" />
        <HomeLinks to="/">Crear Acta</HomeLinks>
        {adminState === true && (
          <>
            <HomeLinks to="/" onClick={() => dispatch(admin())}>
              Cerrar
            </HomeLinks>
            <HomeLinks to="/admin">Panel de Administrador</HomeLinks>
          </>
        )}
        <CreateBugReport />
      </Container>

      <Modal isOpen={adminPassModal} style={ModalStyles} ariaHideApp={false}>
        <Form onSubmit={handleAdm}>
          <Title onClick={() => setAdminPassModal(!adminPassModal)}>Contraseña Administrador</Title>
          <InputContainer>
            <Input
              type="password"
              name="adminPass"
              value={adminPass}
              placeholder="Contraseña"
              onChange={(e) => setAdminPass(e.target.value)}
            />
          </InputContainer>
        </Form>
      </Modal>
    </NavBarContainer>
  );
}

export default NavBar;

const NavBarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20%;
  height: 100%;
  position: fixed;
  background: ${principalColor};
  transition: all 0.5s ease;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  width: 100%;
  padding-top: 20%;
  padding-inline: 5px;
  transition: all 0.5s ease;
`;

const HomeLinks = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 8%;
  font-size: larger;
  padding: 20px;
  margin-bottom: 15%;
  border-radius: 10px;
  text-decoration: none;
  background: #ffffff;
  color: ${Variables.principalColor};
  border: 2px solid #ffffff;

  transition: all 0.3s ease-in;

  &:hover {
    background: ${principalColor};
    border: 2px solid #ffffff;
    color: #ffffff;
  }
`;

const Logo = styled.img`
  width: 50%;
  margin-bottom: 30%;
  transition: all 0.5s ease;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 5%;
  color: white;
`;

const Title = styled.h4`
  border-bottom: 2px solid white;
  width: 120%;
  text-align: center;
  margin-bottom: 2%;
  padding-bottom: 10px;
`;

const InputContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  border-bottom: 1px solid ${secondaryColor};
`;

const Input = styled.input`
  ${input}
  font-size: medium;
  text-align: center;
  max-height: 30%;
  max-width: 60%;
`;

const HiddenButton = styled.button`
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 5px;
  background: transparent;
  background-color: transparent;
  border: transparent;

  &:hover {
    cursor: help;
  }
`;