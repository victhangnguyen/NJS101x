$(function () {
  'use strict';
  //! datepicker1-covidstatus-vaccine
  $('#datepicker1-covidstatus-vaccine').datepicker({
    autoclose: true,
    todayHighlight: true,
  });
  $('#datepicker1-covidstatus-vaccine').datepicker('setDate', new Date());

  //! datepicker2-covidstatus-positive
  $('#datepicker2-covidstatus-positive').datepicker({
    autoclose: true,
    todayHighlight: true,
  });
  $('#datepicker2-covidstatus-positive').datepicker('setDate', new Date());

  //! datepicker3-absence-date
  const datesDisabled = $('input#input-dates-disabled').val().split(',');
  $('#datepicker3-absence-date').datepicker({
    multidate: true,
    multidateSeparator: ' - ',
    // autoclose: true,
    todayHighlight: true,
    datesDisabled: datesDisabled,
  });
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
