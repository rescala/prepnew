$(function () {


    $('.seccionesLista').on('change', function () {
        var valor = $('.seccionesLista').find(":selected").val();
        $('#example6 tbody').html('');
        console.log(valor);
        $.ajax({
            url: "/delegados/listaXseccion/" + valor,
            method: "GET",
            success: function (response) {
                console.log(response);
                for (let index = 0; index < response.length; index++) {

                    if (!response[index].del_nombre) {
                        $('#example6 tbody').append("<tr><td> " + response[index].id_persona + "</td><td>" + response[index].seccion_lista + " </td><td>" + response[index].casilla_lista + " </td><td>" + response[index].ape_pat + " " + response[index].ape_mal + " " + response[index].nom2 + "</td><td>" + response[index].direccion + " </td><td><div class='form-check'><input class='form-check-input' type='checkbox' name='asignar'value='" + response[index].id_persona + "' id='flexCheckDefault'><label class='form-check-label' for='flexCheckDefault'>Registrar</label></div></td></tr>");
                    } else {
                        $('#example6 tbody').append("<tr><td style='color:red';> " + response[index].id_persona + "</td><td style='color:red';>" + response[index].seccion_lista + " </td><td style='color:red';>" + response[index].casilla_lista + " </td><td style='color:red';>" + response[index].ape_pat + "  " + response[index].ape_mal + " " + response[index].nom2 + "</td><td style='color:red';>" + response[index].direccion + " </td><td style='color:red';>" + response[index].del_nombre + " " + response[index].del_apepat + " " + response[index].del_apemat + "</td></tr>");
                    }
                }
            }
        })

    });


    $('#seccion').on('change', function () {
        var valor = $('#seccion').find(":selected").val();
        $('#casilla').html('');
        console.log(valor);
        $.ajax({
            url: "/casillas/cons_casilla/" + valor,
            method: "GET",
            success: function (response) {
                console.log(response);
                for (let index = 0; index < response.length; index++) {
                    $('#casilla').append('<option value="'+response[index].id+'">'+response[index].casilla+'</option>');
                }
                
            }
        })

    });


    /*$('#cargar').on('click', function () {
        let valor = $('#valor').val();
        let parametro = $('select').find(":selected").val();
        if (!valor) {
            valor = "0";
        }
        console.log(parametro + "  " + valor);
        $.ajax({
            url: "/visores/seccionesT/" + parametro + "/" + valor,
            method: "GET",
            success: function (response) {
                
                if (response == "Error") {
                    alert("Establezca un parámetro");
                }
                if (response == "") {
                    alert("No se encontraron datos con ese parámetro de búsqueda");
                }
                for (let index = 0; index < response.length; index++) {
                    if (!response[index].apm) {
                        response[index].apm="";
                        response[index].app1="";
                        response[index].app2="";
                    }
                    $('#exampleFill tbody').append("<tr><td style='color:red';> "+response[index].seccion_lista+"</td><td style='color:red';>"+response[index].casilla+" </td><td style='color:red';>"+response[index].num_lista_nominal+" </td><td style='color:red';>"+response[index].vota_pt+" </td><td style='color:red';>"+response[index].ape_pat+" "+response[index].ape_mat+" "+response[index].nom2+"</td><td style='color:red';>"+response[index].programa+" </td><td style='color:red';>"+response[index].monto+" </td><td style='color:red';>"+response[index].telefono+" </td><td style='color:red';>"+response[index].direccion+" </td><td style='color:red';>"+response[index].voto+"</td><td style='color:red';>"+response[index].apm+" "+response[index].app1+" "+response[index].app2+"</td></tr>");
                    //console.log(response[index].nom2);
                }
            }
        })
    });*/



    $('#buscar').on('keyup', function () {
        var filtro = $("#buscar").val().toUpperCase();

        $("#example6 td").each(function () {
            var textoEnTd = $(this).text().toUpperCase();
            if (textoEnTd.indexOf(filtro) >= 0) {
                $(this).addClass("existe");
            } else {
                $(this).removeClass("existe");
            }
        })

        $("#example6 tbody tr").each(function () {
            if ($(this).children(".existe").length > 0) {
                $(this).show();
            } else {
                $(this).hide();
            }
        })

    });


    $('table').on('click', '.vota', function () {
        let row = $(this).closest('tr');
        let id = row.find('.id').text();
        var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
        myModal.show();
        $('#exampleModal').on('click', '.aceptar', function () {
            myModal.hide();
            $.ajax({
                url: "/casillas/votar/" + id,
                method: "PUT",
                success: function (response) {
                    console.log(response);
                    if (response = 'Actualizado') {
                        $(".inner").addClass("show");
                        row.remove();
                    } else {
                        $(".inner2").addClass("show");
                    }
                }
            })
        });
    });


    $('table').on('click', '.ver_referidos', function () {
        let row = $(this).closest('tr');
        let id = row.find('.id').text();
        var myModal = new bootstrap.Modal(document.getElementById('Modal_Detalles'));
        $('#example6 tbody').html('');

        $.ajax({
            url: "/visor/referidos_detalle/" + id,
            method: "GET",
            success: function (response) {
                console.log(response);
                for (let index = 0; index < response.length; index++) {
                    if (!response[index].telefono) {
                        response[index].telefono = "Sin Teléfono";
                    }

                    $('#example6 tbody').append("<tr><td>" + response[index].seccion_lista + " </td><td>" + response[index].casilla + " </td><td>" + response[index].ape_pat + " " + response[index].ape_mal + " " + response[index].nom2 + "</td><td>" + response[index].direccion + " </td><td><a href='tel:" + response[index].telefono + "'>" + response[index].telefono + "</a></td></tr>");

                }
                myModal.show();
            }
        })
    });


    $('table').on('click', '.elimina', function () {
        let row = $(this).closest('tr');
        let id = row.find('.id').text();
        var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
        myModal.show();
        $('#exampleModal').on('click', '.aceptar', function () {
            myModal.hide();
            $.ajax({
                url: "/delegados/delete/" + id,
                method: "PUT",
                success: function (response) {
                    console.log(response);
                    if (response = 'Eliminado') {
                        $(".inner").addClass("show");
                        row.remove();
                    } else {
                        $(".inner2").addClass("show");
                    }
                }
            })
        });
    });

    $('table').on('click', '.elimina_promovido', function () {
        let row = $(this).closest('tr');
        let id = row.find('.id').text();
        var myModal = new bootstrap.Modal(document.getElementById('exampleModalB'));
        myModal.show();
        $('#exampleModalB').on('click', '.aceptar', function () {
            myModal.hide();
            $.ajax({
                url: "/delegados/promovidos/delete/" + id,
                method: "PUT",
                success: function (response) {
                    console.log(response);
                    if (response = 'Eliminado') {
                        $(".inner").addClass("show");;
                        row.remove();
                    } else {
                        $(".inner2").addClass("show");
                    }
                }
            })
        });
    });

    $('table').on('click', '.eliminar_lista', function () {
        let row = $(this).closest('tr');
        let id = row.find('.id').text();
        var myModal = new bootstrap.Modal(document.getElementById('exampleModal5'));
        var myModal1000 = new bootstrap.Modal(document.getElementById('exampleModa1000'));
        myModal.show();
        $('#exampleModal5').on('click', '.aceptar', function () {
            myModal.hide();
            myModal1000.show();
            $.ajax({
                url: "/mpios/seccion/casillas/lista/eliminar/" + id,
                method: "PUT",
                success: function (response) {
                    console.log(response);
                    if (response = 'Eliminado') {
                        row.remove();
                        myModal1000.hide();
                    } else {
                        $(".inner2").addClass("show");
                    }
                }
            })
        });
    });


    $('table').on('click', '.sumar_lista', function () {
        let row = $(this).closest('tr');
        var row_index = $(this).closest("tr").index();
        let id = row.find('.id').text();
        var myModal = new bootstrap.Modal(document.getElementById('exampleModal6'));
        var myModal1000 = new bootstrap.Modal(document.getElementById('exampleModa1000'));
        myModal.show();
        $('#exampleModal6').on('click', '.aceptar', function () {
            var myform = document.getElementById("informacion_nueva");
            var fd = jQuery(myform).serialize();
            console.log(fd);
            myModal.hide();
            //Modal para marcar que se espere a que se actualice todo
            myModal1000.show();

            $.ajax({
                url: "/mpios/seccion/casilla/lista/add/" + id,
                data: fd,
                cache: false,
                method: "POST",
                success: function (response) {
                    console.log(response);
                    if (response = 'Creado') {
                        
                        myModal1000.hide();
                        location.reload();
                    } else {
                        $(".inner2").addClass("show");
                    }
                }
            })
        });
    });

    $('table').on('click', '.ver_detalles', function () {
        let row = $(this).closest('tr');
        let id = row.find('.id').text();
        var myModal = new bootstrap.Modal(document.getElementById('exampleModal0'));
        $.ajax({
            url: "/mpios/detalles2/" + id,
            method: "GET",
            success: function (response) {
                $('i.n_lista').text(response[0].num_lista_nominal);
                $('i.app').text(response[0].ape_pat);
                $('i.apm').text(response[0].ape_mal);
                $('i.nombres').text(response[0].nom2);
                $('i.direccion').text(response[0].direccion);
                if (response[0].telefono == "") {
                    $('i.tel').text('Sin Teléfono Registrado');
                } else {
                    $('i.tel').text(response[0].telefono);
                }
                $('i.programa').text(response[0].programa);
                $('i.monto').text(response[0].monto);
                if (response[0].presidencia == "") {
                    $('i.preside').text('No trabaja en Presidencia');
                } else {
                    $('i.preside').text(response[0].presidencia);
                }
                if (response[0].detalles == "") {
                    $('i.detalle').text('Sin Detalles');
                } else {
                    $('i.detalle').text(response[0].detalles);
                }
                myModal.show();
            }
        })
    });

    $('table').on('click', '.ver_detalles2', function () {
        let row = $(this).closest('tr');
        let id = row.find('.estaes').text();
        var myModal = new bootstrap.Modal(document.getElementById('exampleModal0'));
        $.ajax({
            url: "/visor/detalles/" + id,
            method: "GET",
            success: function (response) {
                $('.n_lista').text(response[0].num_lista_nominal);
                $('.app').text(response[0].ape_pat);
                $('.apm').text(response[0].ape_mal);
                $('.nombres').text(response[0].nombres);
                $('.direccion').text(response[0].direccion);
                if (response[0].telefono == "") {
                    $('.tel').text('Sin Teléfono Registrado');
                } else {
                    $('.tel').text(response[0].telefono);
                }
                if (response[0].programa == "") {
                    $('.programa').text('Sin Apoyo Registrado');
                } else {
                    $('.programa').text(response[0].programa);
                }
                if (response[0].monto == "") {
                    $('.monto').text('');
                } else {
                    if (response[0].monto == 0) {
                        $('.monto').text('');
                    } else {
                        $('.monto').text(response[0].monto);
                    }
                }
                if (response[0].presidencia == "") {
                    $('.preside').text('No trabaja en Presidencia');
                } else {
                    $('.preside').text(response[0].presidencia);
                }
                if (response[0].detalles == "") {
                    $('.detalle').text('Sin Detalles');
                } else {
                    $('.detalle').text(response[0].detalles);
                }
                myModal.show();
            }
        })
    });

    $("input.num_lista_nominal").on('keyup', function (e) {
        var myModal = new bootstrap.Modal(document.getElementById('confirmacion_update'));
        var myModal2 = new bootstrap.Modal(document.getElementById('error_update'));
        if (e.key === 'Enter' || e.keyCode === 13) {
            let row = $(this).closest('tr');
            let num = $(this).val();
            let id = row.find('.id').text();
            $.ajax({
                url: "/delegados/acomodarlista/" + id + "/" + num,
                method: "GET",
                success: function (response) {
                    if (response == "Actualizado") {
                        $("input.num_lista_nominal").attr('readonly', true);
                        myModal.show();
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    myModal2.show();
                }
            })
        }
    });

    

    $('table').on('click', '.editar_promovido2', function () {
        var row = $(this).closest('tr');
        let id = row.find('.id').text();
        var myModal = new bootstrap.Modal(document.getElementById('editarModal'));
        $.ajax({
            url: "/delegados/detalles/" + id,
            method: "GET",
            success: function (response) {
                console.log(response);
                $('input.id').val(response[0].id); 
                $('#editarModal input.num_lista_nominal').val(response[0].num_lista_nominal);
                $('input.app').val(response[0].ape_pat);
                $('input.apm').val(response[0].ape_mal);
                $('input.nombres').val(response[0].nombres);
                $('input.direccion').val(response[0].direccion);
                $('input.telefono').val(response[0].telefono);
                $('input.programa').val(response[0].programa);
                $('input.monto').val(response[0].monto);
                $("#vota_pt option[value=" + response[0].vota_pt + "]").attr('selected', 'selected');
                $("#id_casilla option:selected").removeAttr('selected');
                $("#id_casilla option[value=" + response[0].id_casilla + "]").attr('selected', 'selected');
                $('input.presidencia').val(response[0].presidencia);
                $('input.detalles').val(response[0].detalles);
                myModal.show();
                $('#editarModal').on('click', '.aceptar', function () {
                    var myModal = new bootstrap.Modal(document.getElementById('editarModal'));
                    var myform = document.getElementById("actualizarForm");
                    var fd = jQuery(myform).serialize();
                    $.ajax({
                        url: "/delegados/editar_accion/",
                        data: fd,
                        cache: false,
                        method: "POST",
                        success: function (response) {
                            
                            myModal.hide();
                            $('#actualizarForm').on('submit', function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                            });
                            console.log(response);
                            if (id==response[0].id){
                                row.find('.nombre').html(response[0].ape_pat+ " " + response[0].ape_mal + " " + response[0].nombres);
                            row.find('.casilla').html(response[0].casilla);
                            if (response[0].vota_pt<1) {
                                row.find('.vota_pt').html('No');    
                            }
                            if (response[0].vota_pt>0) {
                                row.find('.vota_pt').html('Si');    
                            }                            
                            if (response[0].presidencia=="") {
                                row.find('.presidencia').html('No');    
                            }
                            if (response[0].presidencia!="") {
                                row.find('.presidencia').html('Si');    
                            }
                            }
                            
                        }
                    })
                });
            }
        })
    });

    $('table').on('click', '.editar_promovido', function () {
        var row = $(this).closest('tr');
        let id = row.find('.id').text();
        var myModal = new bootstrap.Modal(document.getElementById('editarModal'));
        $.ajax({
            url: "/delegados/detalles/" + id,
            method: "GET",
            success: function (response) {
                $('input.id').val(response[0].id); 
                $('#editarModal input.num_lista_nominal').val(response[0].num_lista_nominal);
                $('input.app').val(response[0].ape_pat);
                $('input.apm').val(response[0].ape_mal);
                $('input.nombres').val(response[0].nombres);
                $('input.direccion').val(response[0].direccion);
                $('input.telefono').val(response[0].telefono);
                $('input.programa').val(response[0].programa);
                $('input.monto').val(response[0].monto);
                $("#vota_pt option[value=" + response[0].vota_pt + "]").attr('selected', 'selected');
                $("#id_casilla option:selected").removeAttr('selected');
                $("#id_casilla option[value=" + response[0].id_casilla + "]").attr('selected', 'selected');
                $('input.presidencia').val(response[0].presidencia);
                $('input.detalles').val(response[0].detalles);
                myModal.show();
                $('#editarModal').on('click', '.aceptar', function () {
                    var myModal = new bootstrap.Modal(document.getElementById('editarModal'));
                    var myform = document.getElementById("actualizarForm2");
                    var fd = jQuery(myform).serialize();
                    $.ajax({
                        url: "/delegados/editar_accion2/", 
                        data: fd,
                        cache: false,
                        method: "POST",
                        success: function (response) {
                            
                        }
                    })
                });
            }
        })
    });




});