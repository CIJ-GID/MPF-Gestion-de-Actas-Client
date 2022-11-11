import React, { useState } from "react";
import { useEffect } from "react";
//* Redux
import { useDispatch, useSelector } from "react-redux";
import { getAllActas, updateBolsa } from "../../../../redux/actions";
//* Style
import styled, { css } from "styled-components";
import GlobalStyles from "../../../../Styles/GlobalStyles";
import Variables from "../../../../Styles/Variables";
//* Doc
//import generateDoc from "../../generateDoc";
//* Initializations
const { button, input, select } = GlobalStyles;
const { redColor, greenColor, secondaryColor } = Variables;

function CloseBolsa({ closeModal }) {
  const dispatch = useDispatch();

  const [inProcess, setInProcess] = useState(false);
  const [thisDbActa, setThisDbActa] = useState([]);
  const [bagsInProcess, setBagsInProcess] = useState([]);
  const [bagsToClose, setBagsToClose] = useState([]);
  const [state, setState] = useState({
    nroPrecinto: "",
    nroPrecintoBlanco: "",
  });
  const [inProcessState, setInProcessState] = useState({
    nroPrecinto: "",
    leyenda: "",
  });

  const allActasSave = useSelector((state) => state?.allActasSave);
  const currentActa = useSelector((state) => state?.currentActa);

  const handleSubmit = (e) => {
    e.preventDefault();

    inProcess ? dispatch(updateBolsa(inProcessState)) : dispatch(updateBolsa(state));
    closeModal();
  };

  useEffect(() => {
    dispatch(getAllActas());
  }, []);

  useEffect(() => {
    if (allActasSave) {
      allActasSave.map((acta) => {
        if (acta.id === currentActa.id) {
          setThisDbActa(acta);
          const bolsasCompletas = acta.Bolsas.filter((bolsa) => {
            if (bolsa.nroPrecintoBlanco !== null) return;
            if (bolsa.Efectos.length === 0) return;
            let sum = 0;
            bolsa.Efectos.find((ef) => (ef.estado === "completo" ? sum++ : null));
            if (sum === bolsa.Efectos.length) return bolsa.nroPrecinto;
          });
          setBagsToClose(bolsasCompletas);
        }
      });
    }
  }, [allActasSave, currentActa]);

  useEffect(() => {
    if (thisDbActa.Bolsas && bagsToClose.length === 0) {
      setInProcess(true);
      const bolsasInProcess = thisDbActa.Bolsas.filter((bolsa) => bolsa.estado === "en proceso");
      setBagsInProcess(bolsasInProcess);
    }
  }, [thisDbActa]);

  if (!inProcess) {
    return (
      <>
        <Form onSubmit={(e) => handleSubmit(e)}>
          <Title>Cerrar Bolsas</Title>
          <InputContainer>
            <Label>Nro Precinto Bolsa</Label>
            <Select
              value={state.nroPrecinto}
              onChange={(e) => setState({ ...state, nroPrecinto: Number(e.target.value) })}
            >
              <SelectOpt value="">Nro Precinto Bolsa</SelectOpt>
              {bagsToClose.length > 0 &&
                bagsToClose.map(({ nroPrecinto, id, colorPrecinto }) => (
                  <SelectOpt
                    value={nroPrecinto}
                    key={id}
                    style={colorPrecinto === "rojo" ? { color: redColor } : { color: greenColor }}
                  >
                    {nroPrecinto}
                  </SelectOpt>
                ))}
            </Select>
          </InputContainer>
          <InputContainer>
            <Label>Nro Precinto Blanco</Label>
            <Input
              type="number"
              name="nroPrecintoBlanco"
              value={state.nroPrecintoBlanco}
              placeholder="Nro Precinto Blanco"
              onChange={(e) => setState({ ...state, nroPrecintoBlanco: Number(e.target.value) })}
            />
          </InputContainer>
          <Button
            type="submit"
            value="Cerrar Bolsa"
            complete={state.nroPrecintoBlanco !== "" && state.nroprecinto !== "" ? "true" : "false"}
          />
        </Form>
      </>
    );
  } else {
    return (
      <>
        <Form onSubmit={(e) => handleSubmit(e)}>
          <Title>Cerrar Bolsa en Proceso</Title>
          <InputContainer>
            <Label>Nro Precinto Bolsa</Label>
            <Select
              value={inProcessState.nroPrecinto}
              onChange={(e) => setInProcessState({ ...inProcessState, nroPrecinto: Number(e.target.value) })}
            >
              <SelectOpt value="">Nro Precinto Bolsa</SelectOpt>
              {bagsInProcess.length > 0 &&
                bagsInProcess.map(({ nroPrecinto, id, colorPrecinto }) => (
                  <SelectOpt
                    value={nroPrecinto}
                    key={id}
                    style={colorPrecinto === "rojo" ? { color: redColor } : { color: greenColor }}
                  >
                    {nroPrecinto}
                  </SelectOpt>
                ))}
            </Select>
          </InputContainer>
          <InputContainer>
            <Label>Leyenda</Label>
            <TextArea
              name="leyenda"
              value={inProcessState.leyenda}
              placeholder="Leyenda"
              onChange={(e) => setInProcessState({ ...inProcessState, leyenda: e.target.value })}
            />
          </InputContainer>
          <Button
            type="submit"
            value="Cerrar Bolsa en Proceso"
            complete={inProcessState.nroPrecinto !== "" && inProcessState.leyenda !== "" ? "true" : "false"}
          />
        </Form>
      </>
    );
  }
}

export default CloseBolsa;

const Title = styled.h4`
  border-bottom: 2px solid white;
  width: 120%;
  text-align: center;
  margin-bottom: 2%;
  padding-bottom: 10px;
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

const InputContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid ${secondaryColor};
`;

const Label = styled.label`
  flex: 1;
`;

const Input = styled.input`
  ${input}
  font-size: small;
  flex: 1;
  height: 35%;
  text-align: center;
`;

const Select = styled.select`
  ${select}
  font-size: small;
  flex: 1;
  height: 35%;
  text-align: center;
`;

const SelectOpt = styled.option``;

const Button = styled.input`
  ${button}
  padding: 5px;
  padding-inline: 15px;
  text-decoration: none;
  background: white;
  border: 2px solid ${redColor};
  pointer-events: none;
  margin-top: 20px;

  ${(props) =>
    props.complete === "true" &&
    css`
      pointer-events: all;
      border: 2px solid ${greenColor};
    `}
`;

const TextArea = styled.textarea`
  ${input}
  font-size: small;
  flex: 1;
  min-height: 90%;
  max-height: 0px;
  text-align: center;

  &:focus {
    border: none;
    outline: none;
    all: none;
  }
`;
