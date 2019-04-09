

function clearEverything() {
    var input = document.getElementById('test');
    input.value = input.value.slice(0, -1);
}


function showTableData() {
    var input = document.getElementById('txtScreen');
    var myTab = document.getElementById('answer2');
    input.value="";

    // LOOP THROUGH EACH ROW OF THE TABLE AFTER HEADER.
    for (i = 0; i < myTab.rows.length; i++) {

        // GET THE CELLS COLLECTION OF THE CURRENT ROW.
        var objCells = myTab.rows.item(i).cells;

        // LOOP THROUGH EACH CELL OF THE CURENT ROW TO READ CELL VALUES.
        for (var j = 0; j < objCells.length; j++) {
            input.value = input.value + ' ' + objCells.item(j).innerHTML;
            input.value=input.value.replace("<var>","");
            input.value=input.value.replace("</var>","");
        }
        input.value = input.value + '\n';     // ADD A BREAK (TAG).
    }
    input.value=input.value.replace("<var>","");
    input.value=input.value.replace("</var>","");

    $(document).ready(function(){
        $("#showform").submit();
   });

   $(function () {

    $('#fku').click();
});
}