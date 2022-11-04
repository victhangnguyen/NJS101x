$(function () {
  'use strict';
  //! datepicker1-covidstatus-vaccine
  $('#datepicker1-covidstatus-vaccine').datepicker({
    clearBtn: true,
    autoclose: true,
    todayHighlight: true,
  });
  $('#datepicker1-covidstatus-vaccine').datepicker('setDate', new Date());

  //! datepicker2-covidstatus-positive
  $('#datepicker2-covidstatus-positive').datepicker({
    clearBtn: true,
    autoclose: true,
    todayHighlight: true,
  });
  $('#datepicker2-covidstatus-positive').datepicker('setDate', new Date());

  //! datepicker3-absence-day
  const multidate =
    $('input#input-dates-multidate').val() > 0
      ? $('input#input-dates-multidate').val()
      : -1;
  const datesDisabled = $('input#input-dates-disabled').val()?.split(',');
  $('#datepicker3-absence-day').datepicker({
    clearBtn: true,
    container: '#datepicker3-absence-day',
    multidate: multidate,
    multidateSeparator: ' - ',
    // autoclose: true,
    todayHighlight: true,
    datesDisabled: datesDisabled,
  });

  const hoursDisabled = $('input#input-hours-disabled').val()?.split(',');
  // console.log(hoursDisabled);
  //! datepicker4-absence-hours
  $('#datepicker4-absence-hours').datepicker({
    clearBtn: true,
    container: '#datepicker4-absence-hours',
    // autoclose: true,
    todayHighlight: true,
    datesDisabled: hoursDisabled,
  });

  // $('.alert').alert()
});

//! Bootstrap Validation
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      'submit',
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add('was-validated');
      },
      false
    );
  });
})();
