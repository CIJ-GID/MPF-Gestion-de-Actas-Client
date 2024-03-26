import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { saveAs } from "file-saver";
import expressions from "angular-expressions";
import { assign } from "lodash";
import { toast } from "react-toastify";
import template from "assets/template.docx";
import axios from "axios";
import { serverUrl } from "./index";

export function generateDoc() {
  const currentActa = JSON.parse(localStorage.getItem("finalActa")); //* Nos traemos el acta del local storage
  const actaFlag = localStorage.getItem("actaFlag"); //* Nos traemos la flag del local storage

  const { Bolsas, Peritos, Integrantes, dias, mes, anio, hora, processToComplete, id } = currentActa; //* Sacamos las bolsas y los integrantes del acta
  const { observaciones, solicitante, nro_mpf, nro_coop, nro_causa, caratula } = currentActa; //* Desestructuramos el acta
/*
  if (currentActa.processToComplete === "false") {
    //? Si es la primera vez que se imprime, inyecto prop `processToComplete` en true
    axios.put(serverUrl + `/addPropsToActa`, { id: currentActa.id }).catch((err) => {
      console.log(err);
    });
  }
*/
  const Efectos = []; //* Array con todos los efectos con sus nroPrecintoBolsa
  let bagsInProcess = false;
  let integranteNoRepeatLeyend = false;

  Integrantes.map((integrante) => {
    //? Mapeo los integrantes para saber si todos tienen locacion === presencial y mostrar una sola vez la leyenda
    if (Integrantes.length > 1) {
      const match = integrante.locacion === "presencial" || integrante.locacion === "videollamada";
      if (match) {
        integranteNoRepeatLeyend = true;
      }
    }
  });

  Bolsas.map((bolsa) => {
    //? Si es la primera vez que se imprime, inyecto prop `processToCompleteBolsa` en true
    axios.put(serverUrl + `/addPropsToBolsa/2`, { id: bolsa.id }).catch((err) => {
      console.log(err);
    });

    if (bolsa.estado === "cerrada en proceso") {
      bagsInProcess = true;
    }

    if (bolsa.nroPrecintoBlanco) {
      //! ACA HAY QUE INJECTAR A LAS BOLSAS QUE SE IMPRIMEN PRECINTADAS PARA QUE NO SE REPITAN
      axios.put(serverUrl + `/addPropsToBolsa`, { id: bolsa.id }).catch((err) => {
        console.log(err);
      });
    }
    //* Mapeo de las bolsas
    return bolsa.Efectos.map((efecto, index) => {
      //* Mapeo de los efectos
      efecto.nroPrecintoBolsa = bolsa.nroPrecinto;
      efecto.index = index + 1;
      Efectos.push(efecto);
/*
      if (efecto.processToCompleteEfecto !== "true" && efecto.estado === "completo") {
        //? Si es la primera vez que imprime el efecto completado le inyecto prop en true
        axios.put(serverUrl + `/addPropsToEfecto/2`, { id: efecto.id }).catch((e) => {
          console.log(e);
        });
      }
*/
      efecto.Sims.map((s) => {
        //? Si es la primera vez que imprime la sim con extraccion inyecto prop en true
        if (s.tipoExtraccionSim !== "en proceso")
          axios.put(serverUrl + `/addPropsToEfecto`, { id: s.id, type: "sim" }).catch((e) => {
            console.log(e);
          });
      });

      efecto.Sds.map((s) => {
        //? Si es la primera vez que imprime la sd con extraccion inyecto prop en true
        if (s.tipoExtraccionSd !== "en proceso") {
          axios.put(serverUrl + `/addPropsToEfecto`, { id: s.id, type: "sd" }).catch((e) => {
            console.log(e);
          });
        }
      });

      efecto.Discos.map((d) => {
        //? Si es la primera vez que imprime el disco completo inyecto prop en true
        if (d.estado === "completo") {
          axios.put(serverUrl + `/addPropsToEfecto`, { id: d.id, type: "disco" }).catch((e) => {
            console.log(e);
          });
        }
      });
    });
  });

  if (Bolsas.length === 0 || Peritos.length === 0) {
    return toast.warning("¡Faltan datos para poder imprimir el Acta!");
  }

  function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
  }

  function replaceErrors(key, value) {
    if (value instanceof Error) {
      return Object.getOwnPropertyNames(value).reduce(function (error, key) {
        error[key] = value[key];
        return error;
      }, {});
    }
    return value;
  }

  expressions.filters.lower = function (input) {
    // * Make sure that if your input is undefined, your
    // * output will be undefined as well and will not
    // * throw an error
    if (!input) return input;
    return input.toLowerCase();
  };
  function angularParser(tag) {
    //eslint-disable-next-line
    tag = tag.replace(/^\.$/, "this").replace(/(’|‘)/g, "'").replace(/(“|”)/g, '"');
    const expr = expressions.compile(tag);
    return {
      get: function (scope, context) {
        let obj = {};
        const scopeList = context.scopeList;
        const num = context.num;
        for (let i = 0, len = num + 1; i < len; i++) {
          obj = assign(obj, scopeList[i]);
        }
        return expr(scope, obj);
      },
    };
  } // ? IDK what this Function do, but its need to the conditions to work...

  loadFile(template, function (error, content) {
    if (error) {
      throw error;
    }
    var zip = new PizZip(content);
    var doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      parser: angularParser,
    });

    doc.setData({
      actaId: id,
      encabezadoFlag: actaFlag,
      dias: dias,
      mes: mes,
      anio: anio,
      hora: hora,
      solicitante: solicitante,
      nro_mpf: nro_mpf,
      nro_coop: nro_coop,
      nro_causa: nro_causa,
      caratula: caratula,
      peritos: Peritos,
      integrantes: Integrantes,
      bolsas: Bolsas,
      efectos: Efectos,
      observaciones: observaciones,
      processToComplete: processToComplete,
      bagsInProcess: bagsInProcess,
      integranteNoRepeatLeyend: integranteNoRepeatLeyend,
    });
    try {
      doc.render();
    } catch (error) {
      console.log(JSON.stringify({ error: error }, replaceErrors));

      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors
          .map(function (error) {
            return error.properties.explanation;
          })
          .join("\n");
        console.log("errorMessages", errorMessages);
        // errorMessages is a humanly readable message looking like this :
        // 'The tag beginning with "foobar" is unopened'
      }
      throw error;
    }
    var out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }); //Output the document using Data-URI
    saveAs(out, `Acta_${currentActa.nro_mpf || currentActa.nro_coop}.docx`);
  });
}
