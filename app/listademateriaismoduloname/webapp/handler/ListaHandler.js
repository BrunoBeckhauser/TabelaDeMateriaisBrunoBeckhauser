sap.ui.define([], () => {
    "use strict";

    const INITIAL_LOAD_QUANTITY = 10;

    const _extractResult = async (oOperation) => {
        const oContext = oOperation.getBoundContext();
        if (!oContext) {
            return null;
        }

        if (oContext.requestObject) {
            return oContext.requestObject();
        }

        return oContext.getObject();
    };

    const _extractErrorMessage = (oError) => {
        if (oError?.error?.message) {
            return oError.error.message;
        }

        if (oError?.message) {
            return oError.message;
        }

        if (oError?.cause?.message) {
            return oError.cause.message;
        }

        return "Erro ao processar a operacao.";
    };

    const _normalizeCollection = (vResult) => {
        if (Array.isArray(vResult)) {
            return vResult;
        }

        if (Array.isArray(vResult?.value)) {
            return vResult.value;
        }

        return [];
    };

    return {
        registerModel: function (oController) {
            const oViewModel = new sap.ui.model.json.JSONModel({
                filtro: String(INITIAL_LOAD_QUANTITY),
                tableMaterial: [],
                busy: false,
                novoMaterial: {
                    NumMat: "",
                    Nome: "",
                    Descr: ""
                }
            });

            oController.getView().setModel(oViewModel, "materiais");
            return oViewModel;
        },

        loadTableData: async function (oController, iQuantidade) {
            const oViewModel = oController.getView().getModel("materiais");
            const oODataModel = oController.getOwnerComponent().getModel();
            const iQtd = Number.isInteger(iQuantidade) ? iQuantidade : INITIAL_LOAD_QUANTITY;

            oViewModel.setProperty("/busy", true);

            try {
                const oOperation = oODataModel.bindContext("/filtroMateriais(...)");
                oOperation.setParameter("quantidade", iQtd);
                await oOperation.execute();

                const vResult = await _extractResult(oOperation);
                const aMateriais = _normalizeCollection(vResult);

                oViewModel.setProperty("/filtro", String(iQtd));
                oViewModel.setProperty("/tableMaterial", aMateriais);
            } catch (oError) {
                throw new Error(_extractErrorMessage(oError));
            } finally {
                oViewModel.setProperty("/busy", false);
            }
        },

        createMaterial: async function (oController) {
            const oViewModel = oController.getView().getModel("materiais");
            const oPayload = oViewModel.getProperty("/novoMaterial");
            const oODataModel = oController.getOwnerComponent().getModel();

            try {
                const oAction = oODataModel.bindContext("/adicionarMaterial(...)");
                oAction.setParameter("ID", 0);
                oAction.setParameter("NumMat", Number(oPayload.NumMat));
                oAction.setParameter("Nome", oPayload.Nome);
                oAction.setParameter("Descr", oPayload.Descr);
                await oAction.execute();

                const vResult = await _extractResult(oAction);
                return typeof vResult === "string" ? vResult : vResult?.value || "Material cadastrado com sucesso.";
            } catch (oError) {
                throw new Error(_extractErrorMessage(oError));
            }
        },

        resetCreatePayload: function (oController) {
            const oViewModel = oController.getView().getModel("materiais");
            oViewModel.setProperty("/novoMaterial", {
                NumMat: "",
                Nome: "",
                Descr: ""
            });
        }
    };
});
