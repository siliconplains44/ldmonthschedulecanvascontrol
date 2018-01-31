/**
 * Created by User on 7/12/2016.
 */
define(["require", "exports", "./monthscheduleviewcontrol", "jquery", "moment"], function (require, exports, monthscheduleviewcontrol_1, $, moment) {
    "use strict";
    monthscheduleviewcontrol_1.MonthScheduleViewControl;
    $(function () {
        // initialize all controls and settings
        $('#controlheight').val($('#control').height());
        $('#controlwidth').val($('#control').width());
        // create our schedule control
        var options = new monthscheduleviewcontrol_1.MonthScheduleViewControlOptions();
        options.backColor = "darkgrey";
        options.defaultAppointmentColor = "green";
        options.dayHeaderFontColor = "black";
        options.gridColor = "purple";
        options.viewMode = monthscheduleviewcontrol_1.ViewMode.MonthCal;
        options.widthDayViewBreakpointInPixels = 768;
        var control = new monthscheduleviewcontrol_1.MonthScheduleViewControl($('#control')[0], options);
        // load sample data
        control.setYearAndMonth(2017, "March");
        control.setDay(1);
        // add appointments
        var amoment = moment("2017-02-26");
        var appointment1 = new monthscheduleviewcontrol_1.Appointment();
        appointment1.id = 0;
        appointment1.title = "Appointment 1";
        appointment1.fromDateTime = moment('2017-03-01');
        appointment1.toDateTime = moment('2017-03-01');
        appointment1.isAllDay = true;
        appointment1.color = "green";
        control.addAppointment(appointment1);
        var appointment2 = new monthscheduleviewcontrol_1.Appointment();
        appointment2.id = 100000;
        appointment2.title = "Appointment 2 abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
        appointment2.fromDateTime = moment('2017-03-01 08:00:00');
        appointment2.toDateTime = moment('2017-03-01 09:00:00');
        appointment2.isAllDay = false;
        appointment2.color = "green";
        control.addAppointment(appointment2);
        var appointment3 = new monthscheduleviewcontrol_1.Appointment();
        appointment3.id = 2000000;
        appointment3.title = "Appointment 3 abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
        appointment3.fromDateTime = moment('2017-03-01 10:00:00');
        appointment3.toDateTime = moment('2017-03-01 11:00:00');
        appointment3.isAllDay = false;
        appointment3.color = "green";
        control.addAppointment(appointment3);
        var id = 0;
        while (amoment.month() == 2 /*"March"*/ ||
            amoment.month() == 1 /*"February"*/ ||
            amoment.month() == 3 /*"April"*/) {
            for (var i = 0; i < 20; i++) {
                var appointmentRepeated = new monthscheduleviewcontrol_1.Appointment();
                appointmentRepeated.id = id;
                appointmentRepeated.title = "Appointment " + i + " abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
                appointmentRepeated.fromDateTime = moment(amoment);
                appointmentRepeated.toDateTime = moment(amoment);
                appointmentRepeated.isAllDay = true;
                appointmentRepeated.color = "green";
                control.addAppointment(appointmentRepeated);
                id++;
            }
            amoment.add('days', 1);
        }
        control.draw();
        // events
        control.setAppointmentClickCallback(function (isMoreBox, date, id) {
            if (isMoreBox == true) {
                alert("date box more box clicked!");
            }
            else {
                alert("appointment " + id + " clicked!");
            }
        });
        $('#buttonsetheight').click(function () {
            control.setHeight(parseInt($('#controlheight').val()));
        });
        $('#buttonsetwidth').click(function () {
            control.setWidth(parseInt($('#controlwidth').val()));
        });
        $(window).resize(function () {
            var can = document.querySelector('#control');
            var width = $(can).parent().width();
            var height = $(can).parent().height();
            control.setWidth(width);
            if ($('#canvasparent').width() <= 768) {
                height = 2000;
                $('#canvasparent').height(2000);
            }
            else {
                height = 600;
                $('#canvasparent').height(height);
            }
            control.setHeight(height);
            $('#controlwidth').val(width);
            $('#controlheight').val(height);
        });
    });
});
//# sourceMappingURL=testpage.js.map