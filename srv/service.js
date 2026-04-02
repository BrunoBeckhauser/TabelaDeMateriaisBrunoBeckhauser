const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Material } = this.entities;

    this.on('filtroMateriais', async (req) => {
        const quantidade = Number(req?.data?.quantidade);

        if (req?.data?.quantidade === undefined || req?.data?.quantidade === null) {
            return req.error(400, 'Parâmetro quantidade não informado.');
        }

        if (!Number.isInteger(quantidade) || quantidade < 0) {
            return req.error(400, 'Parâmetro quantidade deve ser um inteiro maior ou igual a zero.');
        }

        if (quantidade === 0) {
            return [];
        }

        const materiais = await SELECT
            .from(Material)
            .orderBy('ID asc')
            .limit(quantidade);

        return materiais;
    });

    this.on('adicionarMaterial', async (req) => {
        const { ID, NumMat, Nome, Descr } = req.data;
        const tx = cds.transaction(req);

        if (
            ID === undefined || ID === null ||
            NumMat === undefined || NumMat === null ||
            Nome === undefined || Nome === null ||
            Descr === undefined || Descr === null
        ) {
            return req.error(400, 'Campos obrigatórios: ID, NumMat, Nome, Descr.');
        }

        const lvNumMat = Number(NumMat);
        const lvNome = String(Nome).trim();
        const lvDescr = String(Descr).trim();

        if (!Number.isInteger(lvNumMat) || lvNumMat <= 0) {
            return req.error(400, 'Campo NumMat deve ser um inteiro maior que zero.');
        }

        if (!lvNome) {
            return req.error(400, 'Campo Nome não informado.');
        }

        if (!lvDescr) {
            return req.error(400, 'Campo Descr não informado.');
        }

        const jaExiste = await tx.run(
            SELECT.one.from(Material).where({ NumMat: lvNumMat })
        );

        if (jaExiste) {
            return req.error(409, `Material já cadastrado para o NumMat ${lvNumMat}.`);
        }

        const ultimoMaterial = await tx.run(
            SELECT.one.from(Material)
                .columns('ID')
                .orderBy('ID desc')
        );

        const proximoID = ultimoMaterial ? Number(ultimoMaterial.ID) + 1 : 1;

        await tx.run(
            INSERT.into(Material).entries({
                ID: proximoID,
                NumMat: lvNumMat,
                Nome: lvNome,
                Descr: lvDescr
            })
        );

        return `Material cadastrado com sucesso. ID=${proximoID}, NumMat=${lvNumMat}.`;
    });
});
