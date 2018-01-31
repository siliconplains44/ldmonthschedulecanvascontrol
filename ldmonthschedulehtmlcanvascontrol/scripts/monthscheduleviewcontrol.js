/**
 * Created by User on 7/11/2016.
 */
define(["require", "exports", "moment"], function (require, exports, moment) {
    "use strict";
    var ViewMode;
    (function (ViewMode) {
        ViewMode[ViewMode["MonthCal"] = 0] = "MonthCal";
        ViewMode[ViewMode["DayCal"] = 1] = "DayCal";
    })(ViewMode = exports.ViewMode || (exports.ViewMode = {}));
    var Appointment = (function () {
        function Appointment() {
        }
        return Appointment;
    }());
    exports.Appointment = Appointment;
    var MonthScheduleViewControlOptions = (function () {
        function MonthScheduleViewControlOptions() {
        }
        return MonthScheduleViewControlOptions;
    }());
    exports.MonthScheduleViewControlOptions = MonthScheduleViewControlOptions;
    var CalendarDateBox = (function () {
        function CalendarDateBox(left, top, right, bottom, boxDate) {
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
            this.boxDate = boxDate;
        }
        return CalendarDateBox;
    }());
    var CalendarDateBoxEntry = (function () {
        function CalendarDateBoxEntry(left, top, right, bottom, aCalendarDateBox, isMoreBox, aAppointment) {
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
            this.calendarDateBox = aCalendarDateBox;
            this.isMoreBox = isMoreBox;
            this.appointment = aAppointment;
        }
        return CalendarDateBoxEntry;
    }());
    var DayViewBoxEntry = (function () {
        function DayViewBoxEntry(left, top, right, bottom, aAppointment) {
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
            this.appointment = aAppointment;
        }
        return DayViewBoxEntry;
    }());
    var MonthScheduleViewControl = (function () {
        function MonthScheduleViewControl(canvas, options) {
            var _this = this;
            this.arrayAppointments = new Array();
            this.arrayCalendarDateBoxes = new Array();
            this.arrayCalendarDateBoxEntries = new Array();
            this.arrayMoreCalendarDateBoxEntries = new Array();
            this.arrayDayViewBoxEntry = new Array();
            this.currentYear = 2017;
            this.currentMonth = "Jan";
            this.currentDay = 1;
            this.heightCalendarBoxEntry = 20;
            this.draw = function () {
                _this.arrayCalendarDateBoxes = new Array();
                _this.arrayCalendarDateBoxEntries = new Array();
                _this.arrayMoreCalendarDateBoxEntries = new Array();
                _this.arrayDayViewBoxEntry = new Array();
                var self = _this;
                var ctx = _this.canvas.getContext("2d");
                var canvasheight = _this.canvas.height;
                var canvaswidth = _this.canvas.width;
                // draw background
                ctx.fillStyle = _this.options.backColor;
                ctx.fillRect(0, 0, canvaswidth, canvasheight);
                // do we draw the day view or the month view
                if (canvaswidth >= _this.options.widthDayViewBreakpointInPixels) {
                    // draw month grid lines
                    var headerheight = 20;
                    canvasheight = canvasheight - headerheight;
                    var locationOneY = (canvasheight / 5) + headerheight;
                    var locationTwoY = ((canvasheight / 5) * 2) + headerheight;
                    var locationThreeY = ((canvasheight / 5) * 3) + headerheight;
                    var locationFourY = ((canvasheight / 5) * 4) + headerheight;
                    var locationOneX = canvaswidth / 7;
                    var locationTwoX = canvaswidth / 7 * 2;
                    var locationThreeX = canvaswidth / 7 * 3;
                    var locationFourX = canvaswidth / 7 * 4;
                    var locationFiveX = canvaswidth / 7 * 5;
                    var locationSixX = canvaswidth / 7 * 6;
                    // draw days of week header
                    ctx.fillStyle = _this.options.dayHeaderFontColor;
                    ctx.font = '10pt Arial';
                    ctx.fillText('Sun', 2, 13);
                    ctx.fillText('Mon', locationOneX + 2, 13);
                    ctx.fillText('Tue', locationTwoX + 2, 13);
                    ctx.fillText('Wed', locationThreeX + 2, 13);
                    ctx.fillText('Thu', locationFourX + 2, 13);
                    ctx.fillText('Fri', locationFiveX + 2, 13);
                    ctx.fillText('Sat', locationSixX + 2, 13);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = _this.options.gridColor;
                    // draw all horizontal lines
                    ctx.beginPath();
                    ctx.moveTo(0, headerheight);
                    ctx.lineTo(canvaswidth, headerheight);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, locationOneY);
                    ctx.lineTo(canvaswidth, locationOneY);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, locationTwoY);
                    ctx.lineTo(canvaswidth, locationTwoY);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, locationThreeY);
                    ctx.lineTo(canvaswidth, locationThreeY);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, locationFourY);
                    ctx.lineTo(canvaswidth, locationFourY);
                    ctx.stroke();
                    // draw all vertical lines
                    ctx.beginPath();
                    ctx.moveTo(locationOneX, headerheight);
                    ctx.lineTo(locationOneX, canvasheight + headerheight);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(locationTwoX, headerheight);
                    ctx.lineTo(locationTwoX, canvasheight + headerheight);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(locationThreeX, headerheight);
                    ctx.lineTo(locationThreeX, canvasheight + headerheight);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(locationFourX, headerheight);
                    ctx.lineTo(locationFourX, canvasheight + headerheight);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(locationFiveX, headerheight);
                    ctx.lineTo(locationFiveX, canvasheight + headerheight);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(locationSixX, headerheight);
                    ctx.lineTo(locationSixX, canvasheight + headerheight);
                    ctx.stroke();
                    // draw month dates
                    var themonth = new moment();
                    themonth = moment().year(_this.currentYear).month(_this.currentMonth).date(1);
                    var originalstartday = moment(themonth);
                    var firstDayOfMonthWeekDay = themonth.weekday();
                    if (firstDayOfMonthWeekDay != 0) {
                        while (firstDayOfMonthWeekDay != 0) {
                            themonth.subtract(1, 'days');
                            firstDayOfMonthWeekDay = themonth.weekday();
                        }
                    }
                    // themonth should now be set to the first Sunday on our calendar
                    // draw all of our days
                    // week 0
                    ctx.fillText(themonth.date(), 2, headerheight + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(0, headerheight, locationOneX, locationOneY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationOneX + 2, headerheight + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationOneX, headerheight, locationTwoX, locationOneY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationTwoX + 2, headerheight + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationTwoX, headerheight, locationThreeX, locationOneY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationThreeX + 2, headerheight + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationThreeX, headerheight, locationFourX, locationOneY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationFourX + 2, headerheight + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFourX, headerheight, locationFiveX, locationOneY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationFiveX + 2, headerheight + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFiveX, headerheight, locationSixX, locationOneY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationSixX + 2, headerheight + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationSixX, headerheight, canvaswidth, locationOneY, moment(themonth)));
                    themonth.add(1, 'days');
                    // week 1
                    ctx.fillText(themonth.date(), 2, locationOneY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(0, locationOneY, locationOneX, locationTwoY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationOneX + 2, locationOneY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationOneX, locationOneY, locationTwoX, locationTwoY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationTwoX + 2, locationOneY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationTwoX, locationOneY, locationThreeX, locationTwoY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationThreeX + 2, locationOneY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationThreeX, locationOneY, locationFourX, locationTwoY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationFourX + 2, locationOneY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFourX, locationOneY, locationFiveX, locationTwoY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationFiveX + 2, locationOneY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFiveX, locationOneY, locationSixX, locationTwoY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationSixX + 2, locationOneY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationSixX, locationOneY, canvaswidth, locationTwoY, moment(themonth)));
                    themonth.add(1, 'days');
                    // week 2
                    ctx.fillText(themonth.date(), 2, locationTwoY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(0, locationTwoY, locationOneX, locationThreeY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationOneX + 2, locationTwoY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationOneX, locationTwoY, locationTwoX, locationThreeY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationTwoX + 2, locationTwoY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationTwoX, locationTwoY, locationThreeX, locationThreeY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationThreeX + 2, locationTwoY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationThreeX, locationTwoY, locationFourX, locationThreeY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationFourX + 2, locationTwoY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFourX, locationTwoY, locationFiveX, locationThreeY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationFiveX + 2, locationTwoY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFiveX, locationTwoY, locationSixX, locationThreeY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationSixX + 2, locationTwoY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationSixX, locationTwoY, canvaswidth, locationThreeY, moment(themonth)));
                    themonth.add(1, 'days');
                    // week 3
                    ctx.fillText(themonth.date(), 2, locationThreeY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(0, locationThreeY, locationOneX, locationFourY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationOneX + 2, locationThreeY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationOneX, locationThreeY, locationTwoX, locationFourY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationTwoX + 2, locationThreeY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationTwoX, locationThreeY, locationThreeX, locationFourY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationThreeX + 2, locationThreeY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationThreeX, locationThreeY, locationFourX, locationFourY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationFourX + 2, locationThreeY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFourX, locationThreeY, locationFiveX, locationFourY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationFiveX + 2, locationThreeY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFiveX, locationThreeY, locationSixX, locationFourY, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationSixX + 2, locationThreeY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationSixX, locationThreeY, canvaswidth, locationFourY, moment(themonth)));
                    themonth.add(1, 'days');
                    // week 4
                    ctx.fillText(themonth.date(), 2, locationFourY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(0, locationFourY, locationOneX, canvasheight + headerheight, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationOneX + 2, locationFourY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationOneX, locationFourY, locationTwoX, canvasheight + headerheight, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationTwoX + 2, locationFourY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationTwoX, locationFourY, locationThreeX, canvasheight + headerheight, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationThreeX + 2, locationFourY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationThreeX, locationFourY, locationFourX, canvasheight + headerheight, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationFourX + 2, locationFourY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFourX, locationFourY, locationFiveX, canvasheight + headerheight, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationFiveX + 2, locationFourY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFiveX, locationFourY, locationSixX, canvasheight + headerheight, moment(themonth)));
                    themonth.add(1, 'days');
                    ctx.fillText(themonth.date(), locationSixX + 2, locationFourY + 13);
                    _this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationSixX, locationFourY, canvaswidth, canvasheight + headerheight, moment(themonth)));
                    themonth.add(1, 'days');
                    // draw appointments
                    themonth = originalstartday;
                    var maxCalendarBoxEntries_1 = _this.retrieveMaxCalendarBoxEntries(_this.arrayCalendarDateBoxes[0]);
                    $.each(_this.arrayCalendarDateBoxes, function (itemindex, calendarDateBox) {
                        self.drawCalendarBoxEntries(calendarDateBox, maxCalendarBoxEntries_1, ctx);
                    });
                    // more box if showing
                    if (self.isMoreShowing == true) {
                        var canvasCenterX = canvaswidth / 2;
                        var canvasCenterY = canvasheight / 2;
                        var heightCalendarEntry = 20;
                        var widthCalendarEntry_1 = self.arrayCalendarDateBoxes[0].right - self.arrayCalendarDateBoxes[0].left;
                        var leftMoreBox = canvasCenterX - ((widthCalendarEntry_1) + 6); // cals 2 pixs space on left, middle, right and 2 entries per row
                        var topMoreBox = heightCalendarEntry;
                        var rightMoreBox = (canvasCenterX - leftMoreBox) + canvasCenterX;
                        var bottomMoreBox = canvasheight - heightCalendarEntry;
                        ctx.beginPath();
                        ctx.rect(leftMoreBox, heightCalendarEntry, rightMoreBox - leftMoreBox, bottomMoreBox - topMoreBox);
                        ctx.fillStyle = self.options.backColor;
                        ctx.fill();
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = 'black';
                        ctx.stroke();
                        var arrayAppointments = _this.retrieveAppointmentsForGivenDate(self.moreShowingDate);
                        var currentY_1 = self.heightCalendarBoxEntry + 2;
                        var xLeft_1 = leftMoreBox + 2; // offset our entries in the box with 2 pixels on the left and right
                        var xRight_1 = xLeft_1 + widthCalendarEntry_1;
                        var maxMoreBoxEntries = (bottomMoreBox - topMoreBox) / (self.heightCalendarBoxEntry + 1);
                        var maxEntriestoDraw_1 = maxMoreBoxEntries; // remove one for the + more at the bottom
                        maxEntriestoDraw_1 = Math.floor(maxEntriestoDraw_1);
                        var maxEntriesPerColumn_1 = maxEntriestoDraw_1;
                        maxEntriestoDraw_1 = maxEntriestoDraw_1 * 2;
                        $.each(arrayAppointments, function (index, appointment) {
                            if (maxEntriestoDraw_1 > 0) {
                                // draw our appointment rect
                                ctx.beginPath();
                                ctx.rect(xLeft_1, currentY_1, widthCalendarEntry_1, self.heightCalendarBoxEntry);
                                ctx.fillStyle = appointment.color;
                                ctx.fill();
                                ctx.lineWidth = 1;
                                ctx.strokeStyle = 'black';
                                ctx.stroke();
                                var aCalendarBoxDate = new CalendarDateBox(0, 0, 0, 0, appointment.fromDateTime);
                                var aCalendarDateBoxEntry = new CalendarDateBoxEntry(xLeft_1, currentY_1, xRight_1, currentY_1 + self.heightCalendarBoxEntry, aCalendarBoxDate, false, appointment);
                                self.arrayMoreCalendarDateBoxEntries.push(aCalendarDateBoxEntry);
                                // draw appointment text
                                ctx.fillStyle = 'black';
                                ctx.font = '10pt Arial';
                                ctx.fillText(self.fitString(ctx, appointment.title, widthCalendarEntry_1), xLeft_1 + 2, currentY_1 + self.heightCalendarBoxEntry - 4);
                                currentY_1 += self.heightCalendarBoxEntry;
                                maxEntriestoDraw_1--;
                                if (maxEntriestoDraw_1 == maxEntriesPerColumn_1) {
                                    xLeft_1 = xLeft_1 + widthCalendarEntry_1 + 7;
                                    xRight_1 = xLeft_1 + widthCalendarEntry_1;
                                    currentY_1 = self.heightCalendarBoxEntry + 2;
                                }
                            }
                        });
                        $(_this.canvas).unbind('click').bind('click', function (event) {
                            for (var i = 0; i < self.arrayMoreCalendarDateBoxEntries.length; i++) {
                                var xyVal = self.getMousePos(self.canvas, event);
                                if ((xyVal.x >= self.arrayMoreCalendarDateBoxEntries[i].left) &&
                                    (xyVal.x <= self.arrayMoreCalendarDateBoxEntries[i].right) &&
                                    (xyVal.y >= self.arrayMoreCalendarDateBoxEntries[i].top) &&
                                    (xyVal.y <= self.arrayMoreCalendarDateBoxEntries[i].bottom)) {
                                    self.appointmentClickCallBack(false, self.arrayMoreCalendarDateBoxEntries[i].calendarDateBox.boxDate, self.arrayMoreCalendarDateBoxEntries[i].appointment.id);
                                    self.isMoreShowing = false;
                                    self.draw();
                                }
                            }
                        });
                    }
                    else {
                        $(_this.canvas).unbind('click').bind('click', function (event) {
                            for (var i = 0; i < self.arrayCalendarDateBoxEntries.length; i++) {
                                var xyVal = self.getMousePos(self.canvas, event);
                                if ((xyVal.x >= self.arrayCalendarDateBoxEntries[i].left) &&
                                    (xyVal.x <= self.arrayCalendarDateBoxEntries[i].right) &&
                                    (xyVal.y >= self.arrayCalendarDateBoxEntries[i].top) &&
                                    (xyVal.y <= self.arrayCalendarDateBoxEntries[i].bottom)) {
                                    if (self.arrayCalendarDateBoxEntries[i].isMoreBox == true) {
                                        self.appointmentClickCallBack(true, self.arrayCalendarDateBoxEntries[i].calendarDateBox.boxDate, null);
                                        self.isMoreShowing = true;
                                        self.moreShowingDate = self.arrayCalendarDateBoxEntries[i].calendarDateBox.boxDate;
                                        self.draw();
                                    }
                                    else {
                                        self.isMoreShowing = false;
                                        self.appointmentClickCallBack(false, self.arrayCalendarDateBoxEntries[i].calendarDateBox.boxDate, self.arrayCalendarDateBoxEntries[i].appointment.id);
                                        self.draw();
                                    }
                                    break;
                                }
                            }
                        });
                    }
                }
                else {
                    // draw background
                    ctx.fillStyle = _this.options.backColor;
                    ctx.fillRect(0, 0, canvaswidth, canvasheight);
                    // pull appointments for the current day selected in our control
                    var todayMoment = new moment();
                    todayMoment = moment().year(self.currentYear).month(self.currentMonth).date(self.currentDay);
                    var arrayTodaysAppointments = _this.retrieveAppointmentsForGivenDate(todayMoment);
                    var currentY_2 = 2;
                    // draw appointments - all day
                    $.each(arrayTodaysAppointments, function (index, appointment) {
                        if (appointment.isAllDay == true) {
                            // draw our appointment rect
                            ctx.beginPath();
                            ctx.rect(2, currentY_2, canvaswidth - 4, self.heightCalendarBoxEntry);
                            ctx.fillStyle = appointment.color;
                            ctx.fill();
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = 'black';
                            ctx.stroke();
                            var aDayViewBoxEntry = new DayViewBoxEntry(2, currentY_2, canvaswidth - 4, currentY_2 + self.heightCalendarBoxEntry, appointment);
                            self.arrayDayViewBoxEntry.push(aDayViewBoxEntry);
                            // draw appointment text
                            ctx.fillStyle = 'black';
                            ctx.font = '10pt Arial';
                            ctx.fillText(self.fitString(ctx, appointment.title, canvaswidth - 4), 2 + 2, currentY_2 + self.heightCalendarBoxEntry - 4);
                            currentY_2 += self.heightCalendarBoxEntry + 2;
                        }
                    });
                    currentY_2 += 3; // space 3 down from all day items to schedule
                    // draw our day view appointment time slots!
                    var startdayminute = 0 * 60;
                    var enddayminute = 24 * 60;
                    var minutedayspan = enddayminute - startdayminute;
                    var pixelsperminutey_1 = (canvasheight - currentY_2) / minutedayspan;
                    // draw appointments - with start and end time
                    $.each(arrayTodaysAppointments, function (index, appointment) {
                        if (appointment.isAllDay == false) {
                            var startminute = (appointment.fromDateTime.hour()) * 60;
                            startminute = startminute + appointment.fromDateTime.minute();
                            var endminute = (appointment.toDateTime.hour()) * 60;
                            endminute = endminute + appointment.toDateTime.minute();
                            var offset = 50;
                            ctx.fillStyle = appointment.color;
                            ctx.fillRect(offset, currentY_2 + (startminute * pixelsperminutey_1), canvaswidth - offset, ((endminute - startminute) * pixelsperminutey_1));
                            ctx.font = "14px Arial";
                            ctx.fillStyle = "black";
                            ctx.fillText(self.fitString(ctx, appointment.title, canvaswidth - offset), offset + 2, currentY_2 + (startminute * pixelsperminutey_1) + 15, canvaswidth - offset /* offset */);
                            var aDayViewBoxEntry = new DayViewBoxEntry(offset, currentY_2 + (startminute * pixelsperminutey_1), canvaswidth - offset, currentY_2 + (endminute * pixelsperminutey_1), appointment);
                            self.arrayDayViewBoxEntry.push(aDayViewBoxEntry);
                        }
                    });
                    // draw scale over everything previous
                    for (var i = 0; i < 24 - 0; i++) {
                        ctx.beginPath();
                        ctx.moveTo(0, currentY_2 + ((i * 60) * pixelsperminutey_1));
                        ctx.lineTo(canvaswidth, currentY_2 + ((i * 60) * pixelsperminutey_1));
                        ctx.stroke();
                        var currenthour = 0 + i;
                        var ampm = ' am';
                        if (currenthour > 12) {
                            currenthour = currenthour - 12;
                            ampm = ' pm';
                        }
                        if (currenthour == 0) {
                            currenthour = 12;
                            ampm = ' am';
                        }
                        ctx.font = "14px Arial";
                        ctx.fillStyle = "black";
                        ctx.fillText(currenthour + ampm, 2, currentY_2 + ((i * 60) * pixelsperminutey_1 + 15) /* offset */);
                    }
                    $(_this.canvas).unbind('click').bind('click', function (event) {
                        for (var i = 0; i < self.arrayDayViewBoxEntry.length; i++) {
                            var xyVal = self.getMousePos(self.canvas, event);
                            if ((xyVal.x >= self.arrayDayViewBoxEntry[i].left) &&
                                (xyVal.x <= self.arrayDayViewBoxEntry[i].right) &&
                                (xyVal.y >= self.arrayDayViewBoxEntry[i].top) &&
                                (xyVal.y <= self.arrayDayViewBoxEntry[i].bottom)) {
                                self.appointmentClickCallBack(false, moment().year(self.currentYear).month(self.currentMonth).date(self.currentDay), self.arrayDayViewBoxEntry[i].appointment.id);
                                self.draw();
                                break;
                            }
                        }
                    });
                }
            };
            this.canvas = canvas;
            this.options = options;
            this.draw();
        }
        MonthScheduleViewControl.prototype.getMousePos = function (canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        };
        MonthScheduleViewControl.prototype.retrieveMaxCalendarBoxEntries = function (aCalendarDateBox) {
            return ((aCalendarDateBox.bottom - aCalendarDateBox.top) / this.heightCalendarBoxEntry) - 1; // the 1 is for the top header text
        };
        MonthScheduleViewControl.prototype.compareDates = function (a, b) {
            if (a.fromDateTime.isBefore(b.fromDateTime))
                return -1;
            if (a.fromDateTime.isAfter(b.fromDateTime))
                return 1;
            return 0;
        };
        MonthScheduleViewControl.prototype.retrieveAppointmentsForGivenDate = function (aDate) {
            var arrayAppointments = new Array();
            $.each(this.arrayAppointments, function (index, appointment) {
                if (aDate.date() == appointment.fromDateTime.date()
                    && aDate.year() == appointment.fromDateTime.year()
                    && aDate.month() == appointment.fromDateTime.month()) {
                    arrayAppointments.push(appointment);
                }
            });
            // sort appointments by isAllDay (isAllDay first)
            var arrayAllDayAppointments = new Array();
            var arrayTimedAppointments = new Array();
            $.each(arrayAppointments, function (index, appointment) {
                if (appointment.isAllDay == true) {
                    arrayAllDayAppointments.push(appointment);
                }
                else {
                    arrayTimedAppointments.push(appointment);
                }
            });
            // sort dated appointments in chron order
            arrayTimedAppointments.sort(this.compareDates);
            // now combine arrays to have all day at top and timed after
            arrayAppointments = arrayAllDayAppointments;
            $.each(arrayTimedAppointments, function (index, appointment) {
                arrayAppointments.push(appointment);
            });
            return arrayAppointments;
        };
        MonthScheduleViewControl.prototype.fitString = function (c, str, maxWidth) {
            var width = c.measureText(str).width;
            var ellipsis = '…';
            var ellipsisWidth = c.measureText(ellipsis).width;
            if (width <= maxWidth || width <= ellipsisWidth) {
                return str;
            }
            else {
                var len = str.length;
                while (width >= maxWidth - ellipsisWidth && len-- > 0) {
                    str = str.substring(0, len);
                    width = c.measureText(str).width;
                }
                return str + ellipsis;
            }
        };
        MonthScheduleViewControl.prototype.drawCalendarBoxEntries = function (aCalendarDateBox, maxCalendarBoxEntries, context) {
            var self = this;
            var arrayAppointments = this.retrieveAppointmentsForGivenDate(aCalendarDateBox.boxDate);
            var currentY = aCalendarDateBox.top + self.heightCalendarBoxEntry;
            var xLeft = aCalendarDateBox.left + 1; // offset our entries in the box with 2 pixels on the left and right
            var xRight = aCalendarDateBox.right - 1;
            if (arrayAppointments.length > maxCalendarBoxEntries) {
                var maxEntriestoDraw_2 = maxCalendarBoxEntries - 1; // remove one for the + more at the bottom
                maxEntriestoDraw_2 = Math.floor(maxEntriestoDraw_2);
                $.each(arrayAppointments, function (index, appointment) {
                    if (maxEntriestoDraw_2 > 0) {
                        // draw our appointment rect
                        context.beginPath();
                        context.rect(xLeft, currentY, xRight - xLeft, self.heightCalendarBoxEntry);
                        context.fillStyle = appointment.color;
                        context.fill();
                        context.lineWidth = 1;
                        context.strokeStyle = 'black';
                        context.stroke();
                        var aCalendarDateBoxEntry_1 = new CalendarDateBoxEntry(xLeft, currentY, xRight, currentY + self.heightCalendarBoxEntry, aCalendarDateBox, false, appointment);
                        self.arrayCalendarDateBoxEntries.push(aCalendarDateBoxEntry_1);
                        // draw appointment text
                        context.fillStyle = 'black';
                        context.font = '10pt Arial';
                        context.fillText(self.fitString(context, appointment.title, xRight - xLeft), xLeft + 2, currentY + self.heightCalendarBoxEntry - 4);
                        currentY += self.heightCalendarBoxEntry;
                        maxEntriestoDraw_2--;
                    }
                });
                context.fillStyle = 'black';
                context.font = '10pt Arial';
                context.fillText('+ more', xLeft, aCalendarDateBox.bottom - self.heightCalendarBoxEntry);
                var aCalendarDateBoxEntry = new CalendarDateBoxEntry(xLeft, currentY, xRight, currentY + self.heightCalendarBoxEntry, aCalendarDateBox, true, null);
                self.arrayCalendarDateBoxEntries.push(aCalendarDateBoxEntry);
            }
            else {
                $.each(arrayAppointments, function (index, appointment) {
                    context.beginPath();
                    context.rect(xLeft, currentY, xRight - xLeft, this.heightCalendarBoxEntry);
                    context.fillStyle = appointment.color;
                    context.fill();
                    context.lineWidth = 2;
                    context.strokeStyle = 'black';
                    context.stroke();
                    var aCalendarDateBoxEntry = new CalendarDateBoxEntry(xLeft, currentY, xRight, currentY + self.heightCalendarBoxEntry, aCalendarDateBox, false, appointment);
                    self.arrayCalendarDateBoxEntries.push(aCalendarDateBoxEntry);
                    // draw appointment text
                    context.fillStyle = 'black';
                    context.font = '10pt Arial';
                    context.fillText(self.fitString(context, appointment.title, xRight - xLeft), xLeft + 2, currentY + self.heightCalendarBoxEntry - 4);
                    currentY += this.heightCalendarBoxEntry;
                });
            }
        };
        MonthScheduleViewControl.prototype.setAppointmentClickCallback = function (func) {
            this.appointmentClickCallBack = func;
        };
        MonthScheduleViewControl.prototype.setViewMode = function (viewMode) {
            this.options.viewMode = viewMode;
            this.draw();
        };
        MonthScheduleViewControl.prototype.setYearAndMonth = function (year, month) {
            this.currentYear = year;
            this.currentMonth = month;
            this.draw();
        };
        MonthScheduleViewControl.prototype.setDay = function (day) {
            this.currentDay = day;
            this.draw();
        };
        MonthScheduleViewControl.prototype.setHeight = function (height) {
            this.canvas.height = height;
            this.draw();
        };
        MonthScheduleViewControl.prototype.setWidth = function (width) {
            this.canvas.width = width;
            this.draw();
        };
        MonthScheduleViewControl.prototype.addAppointment = function (aAppointment) {
            this.arrayAppointments.push(aAppointment);
            this.draw();
        };
        MonthScheduleViewControl.prototype.deleteAppointment = function (index) {
            this.arrayAppointments.splice(index, 1);
            this.draw();
        };
        MonthScheduleViewControl.prototype.retrieveAppointments = function () {
            return this.arrayAppointments;
        };
        MonthScheduleViewControl.prototype.retrieveAppointmentCount = function () {
            return this.arrayAppointments.length;
        };
        return MonthScheduleViewControl;
    }());
    exports.MonthScheduleViewControl = MonthScheduleViewControl;
});
//# sourceMappingURL=monthscheduleviewcontrol.js.map