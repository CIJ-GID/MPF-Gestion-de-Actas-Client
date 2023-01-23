import axios from "axios";
import Variables from "../../../Styles/Variables";

const updateEfectos = async () => {
  try {
    const actaId = JSON.parse(localStorage.getItem("currentActa")).id;
    localStorage.setItem("currentEfectos", []);
    const res = await axios.get(Variables.baseEndpoint + `/getActas/${actaId}`);
    if (res) {
      const acta = res.data;
      let efectos = [];
      acta.Bolsas.map((bolsa) => {
        efectos = [...efectos, ...bolsa.Efectos];
      });
      localStorage.setItem("currentEfectos", JSON.stringify(efectos));
      localStorage.setItem("currentBolsas", JSON.stringify(acta.Bolsas));
    }
  } catch (err) {
    console.log(err);
  }
};

export default updateEfectos;
