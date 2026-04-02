using provacap from '../db/schema';

service ProvaBTP {

    entity Material as projection on provacap.Material;

    function filtroMateriais(quantidade : Integer) returns array of Material;

    action adicionarMaterial(
        ID     : Integer,
        NumMat : Integer,
        Nome   : String,
        Descr  : String
    ) returns String;
}
