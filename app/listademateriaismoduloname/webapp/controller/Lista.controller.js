sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "listademateriaismoduloname/handler/ListaHandler"
], (Controller, Fragment, MessageBox, ListaHandler) => {
    "use strict";

    return Controller.extend("listademateriaismoduloname.controller.Lista", {
        onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter
                .getTarget("TargetLista")
                .attachDisplay(this._onRouteMatched, this);
        },

        _onRouteMatched: async function () {
            if (!this.getView().getModel("materiais")) {
                ListaHandler.registerModel(this);
            }

            try {
                await ListaHandler.loadTableData(this, 999);
                this.getView().getModel("materiais").setProperty("/filtro", "");
            } catch (oError) {
                MessageBox.error(oError.message);
            }
        },

        onFiltrarPress: async function () {
            const oViewModel = this.getView().getModel("materiais");
            const sFiltro = String(oViewModel.getProperty("/filtro") || "").trim();
            const iQuantidade = Number(sFiltro);

            if (sFiltro === "") {
                MessageBox.error("Informe a quantidade para o filtro.");
                return;
            }

            if (!Number.isInteger(iQuantidade) || iQuantidade < 0) {
                MessageBox.error("Informe um numero inteiro maior ou igual a zero.");
                return;
            }

            try {
                await ListaHandler.loadTableData(this, iQuantidade);
            } catch (oError) {
                MessageBox.error(oError.message);
            }
        },

        onOpenCreateDialog: async function () {
            ListaHandler.resetCreatePayload(this);

            if (!this._oCreateDialog) {
                this._oCreateDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "listademateriaismoduloname.view.fragment.CreateMaterialDialog",
                    controller: this
                });

                this.getView().addDependent(this._oCreateDialog);
            }

            this._oCreateDialog.open();
        },

        onCreateDialogClose: function () {
            if (this._oCreateDialog) {
                this._oCreateDialog.close();
            }
        },

        onCreateDialogSave: async function () {
            const oViewModel = this.getView().getModel("materiais");
            const oPayload = oViewModel.getProperty("/novoMaterial");
            const iNumMat = Number(oPayload.NumMat);
            const sNome = String(oPayload.Nome || "").trim();
            const sDescr = String(oPayload.Descr || "").trim();
            const iQuantidadeAtual = Number(oViewModel.getProperty("/filtro") || 10);

            if (!Number.isInteger(iNumMat) || iNumMat <= 0) {
                MessageBox.error("Informe um NumMat inteiro maior que zero.");
                return;
            }

            if (!sNome || !sDescr) {
                MessageBox.error("Preencha Nome e Descr antes de criar o material.");
                return;
            }

            oViewModel.setProperty("/novoMaterial/NumMat", iNumMat);
            oViewModel.setProperty("/novoMaterial/Nome", sNome);
            oViewModel.setProperty("/novoMaterial/Descr", sDescr);

            try {
                const sMessage = await ListaHandler.createMaterial(this);
                this.onCreateDialogClose();
                await ListaHandler.loadTableData(this, Number.isInteger(iQuantidadeAtual) ? iQuantidadeAtual : 10);
                MessageBox.success(sMessage);
            } catch (oError) {
                MessageBox.error(oError.message);
            }
        }
    });
});
