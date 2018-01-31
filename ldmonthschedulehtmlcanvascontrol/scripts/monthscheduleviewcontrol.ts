/**
 * Created by User on 7/11/2016.
 */

/// <reference path="../definitions/jquery.d.ts" />
/// <reference path="../definitions/moment.d.ts" />

import * as moment from "moment";

export enum ViewMode {
    MonthCal = 0,
    DayCal = 1,
}

export class Appointment {

    public id : number;
    public title : string;
    public fromDateTime : any; // should be a moment
    public toDateTime : any; // should be a moment
    public isAllDay : boolean;
    public color : string;
}

export class MonthScheduleViewControlOptions {
    public backColor: string;
    public defaultAppointmentColor: string;
    public dayHeaderFontColor: string;
    public gridColor :  string;
    public viewMode : ViewMode;
    public widthDayViewBreakpointInPixels : number;
}

class CalendarDateBox {
    public left : number;
    public top : number;
    public right : number;
    public bottom : number;
    public boxDate : any; // should be a moment

    constructor(left : number, top : number, right : number, bottom: number, boxDate : any)
    {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.boxDate = boxDate;
    }
}

class CalendarDateBoxEntry
{
    public left : number;
    public top : number;
    public right : number;
    public bottom : number;
    public calendarDateBox : CalendarDateBox;
    public appointment : Appointment;
    public isMoreBox : boolean;

    constructor(left : number, top: number, right : number, bottom : number, aCalendarDateBox : CalendarDateBox,
        isMoreBox : boolean, aAppointment : Appointment)
    {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.calendarDateBox = aCalendarDateBox;
        this.isMoreBox = isMoreBox;
        this.appointment = aAppointment;
    }
}

class DayViewBoxEntry
{
    public left : number;
    public top : number;
    public right: number;
    public bottom: number;
    public appointment : Appointment;

    constructor(left : number, top : number, right : number, bottom : number, aAppointment : Appointment)
    {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.appointment = aAppointment;
    }
}

export class MonthScheduleViewControl {

    private canvas: any;
    private options: MonthScheduleViewControlOptions;
    private arrayAppointments: Array<Appointment> = new Array<Appointment>();
    private arrayCalendarDateBoxes : Array<CalendarDateBox> = new Array<CalendarDateBox>();
    private arrayCalendarDateBoxEntries : Array<CalendarDateBoxEntry> = new Array<CalendarDateBoxEntry>();
    private arrayMoreCalendarDateBoxEntries : Array<CalendarDateBoxEntry> = new Array<CalendarDateBoxEntry>();
    private isMoreShowing : boolean;
    private moreShowingDate : any; // is a moment
    private arrayDayViewBoxEntry : Array<DayViewBoxEntry> = new Array<DayViewBoxEntry>();

    private currentYear : number = 2017;
    private currentMonth : string = "Jan";
    private currentDay : number = 1;

    private heightCalendarBoxEntry : number = 20;

    private appointmentClickCallBack : any;

    private getMousePos(canvas, evt)
    {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    private retrieveMaxCalendarBoxEntries(aCalendarDateBox : CalendarDateBox)
    {
        return ((aCalendarDateBox.bottom - aCalendarDateBox.top) / this.heightCalendarBoxEntry) - 1; // the 1 is for the top header text
    }

    private compareDates(a,b) {
        if(a.fromDateTime.isBefore(b.fromDateTime)) return -1;
        if(a.fromDateTime.isAfter(b.fromDateTime)) return 1;
        return 0;
    }

    private retrieveAppointmentsForGivenDate(aDate : moment)
    {
        let arrayAppointments = new Array<Appointment>();

        $.each(this.arrayAppointments, function(index, appointment) {
           if (aDate.date() == appointment.fromDateTime.date()
           && aDate.year() == appointment.fromDateTime.year()
               && aDate.month() == appointment.fromDateTime.month()
           )
           {
               arrayAppointments.push(appointment);
           }
        });

        // sort appointments by isAllDay (isAllDay first)

        let arrayAllDayAppointments = new Array<Appointment>();
        let arrayTimedAppointments = new Array<Appointment>();

        $.each(arrayAppointments, function(index, appointment) {
           if (appointment.isAllDay == true)
           {
               arrayAllDayAppointments.push(appointment);
           }
           else
           {
               arrayTimedAppointments.push(appointment);
           }
        });

        // sort dated appointments in chron order
        arrayTimedAppointments.sort(this.compareDates);

        // now combine arrays to have all day at top and timed after
        arrayAppointments = arrayAllDayAppointments;

        $.each(arrayTimedAppointments, function(index, appointment) {
           arrayAppointments.push(appointment);
        });

        return arrayAppointments;
    }

    private fitString(c, str, maxWidth) {
        var width = c.measureText(str).width;
        var ellipsis = '…';
        var ellipsisWidth = c.measureText(ellipsis).width;
        if (width<=maxWidth || width<=ellipsisWidth) {
            return str;
        } else {
            var len = str.length;
            while (width>=maxWidth-ellipsisWidth && len-->0) {
                str = str.substring(0, len);
                width = c.measureText(str).width;
            }
            return str+ellipsis;
        }
    }

    private drawCalendarBoxEntries(aCalendarDateBox : CalendarDateBox, maxCalendarBoxEntries : number, context : any)
    {
        let self = this;

        let arrayAppointments = this.retrieveAppointmentsForGivenDate(aCalendarDateBox.boxDate);

        let currentY = aCalendarDateBox.top + self.heightCalendarBoxEntry;
        let xLeft = aCalendarDateBox.left + 1; // offset our entries in the box with 2 pixels on the left and right
        let xRight = aCalendarDateBox.right - 1;

        if (arrayAppointments.length > maxCalendarBoxEntries)
        {
            let maxEntriestoDraw = maxCalendarBoxEntries - 1; // remove one for the + more at the bottom
            maxEntriestoDraw = Math.floor(maxEntriestoDraw);

            $.each(arrayAppointments, function(index, appointment) {
                if (maxEntriestoDraw > 0)
                {
                    // draw our appointment rect

                    context.beginPath();
                    context.rect(xLeft, currentY, xRight - xLeft, self.heightCalendarBoxEntry);
                    context.fillStyle = appointment.color;
                    context.fill();
                    context.lineWidth = 1;
                    context.strokeStyle = 'black';
                    context.stroke();

                    let aCalendarDateBoxEntry = new CalendarDateBoxEntry(xLeft, currentY, xRight, currentY + self.heightCalendarBoxEntry, aCalendarDateBox, false, appointment);
                    self.arrayCalendarDateBoxEntries.push(aCalendarDateBoxEntry);

                    // draw appointment text

                    context.fillStyle = 'black';
                    context.font = '10pt Arial';

                    context.fillText(self.fitString(context, appointment.title, xRight - xLeft), xLeft + 2, currentY + self.heightCalendarBoxEntry - 4);

                    currentY += self.heightCalendarBoxEntry;
                    maxEntriestoDraw--;
                }
            });

            context.fillStyle = 'black';
            context.font = '10pt Arial';

            context.fillText('+ more', xLeft, aCalendarDateBox.bottom - self.heightCalendarBoxEntry);

            let aCalendarDateBoxEntry = new CalendarDateBoxEntry(xLeft, currentY, xRight, currentY + self.heightCalendarBoxEntry, aCalendarDateBox, true, null);
            self.arrayCalendarDateBoxEntries.push(aCalendarDateBoxEntry);
        }
        else
        {
            $.each(arrayAppointments, function(index, appointment) {
                context.beginPath();
                context.rect(xLeft, currentY, xRight - xLeft, this.heightCalendarBoxEntry);
                context.fillStyle = appointment.color;
                context.fill();
                context.lineWidth = 2;
                context.strokeStyle = 'black';
                context.stroke();

                let aCalendarDateBoxEntry = new CalendarDateBoxEntry(xLeft, currentY, xRight, currentY + self.heightCalendarBoxEntry, aCalendarDateBox, false, appointment);
                self.arrayCalendarDateBoxEntries.push(aCalendarDateBoxEntry);

                // draw appointment text

                context.fillStyle = 'black';
                context.font = '10pt Arial';

                context.fillText(self.fitString(context, appointment.title, xRight - xLeft), xLeft + 2, currentY + self.heightCalendarBoxEntry - 4);

                currentY += this.heightCalendarBoxEntry;
            });
        }
    }

    public draw = () => {

        this.arrayCalendarDateBoxes = new Array<CalendarDateBox>();
        this.arrayCalendarDateBoxEntries = new Array<CalendarDateBoxEntry>();
        this.arrayMoreCalendarDateBoxEntries = new Array<CalendarDateBoxEntry>();
        this.arrayDayViewBoxEntry = new Array<DayViewBoxEntry>();

        let self = this;

        var ctx = this.canvas.getContext("2d");

        let canvasheight = this.canvas.height;
        let canvaswidth = this.canvas.width;

        // draw background

        ctx.fillStyle = this.options.backColor;
        ctx.fillRect(0, 0, canvaswidth, canvasheight);

        // do we draw the day view or the month view

        if (canvaswidth >= this.options.widthDayViewBreakpointInPixels) // draw the month view
        {
            // draw month grid lines

            let headerheight = 20;

            canvasheight = canvasheight - headerheight;

            let locationOneY = (canvasheight / 5) + headerheight;
            let locationTwoY = ((canvasheight / 5) * 2) + headerheight;
            let locationThreeY = ((canvasheight / 5) * 3) + headerheight;
            let locationFourY = ((canvasheight / 5) * 4) + headerheight;

            let locationOneX = canvaswidth / 7;
            let locationTwoX = canvaswidth / 7 * 2;
            let locationThreeX = canvaswidth / 7 * 3;
            let locationFourX = canvaswidth / 7 * 4;
            let locationFiveX = canvaswidth / 7 * 5;
            let locationSixX = canvaswidth / 7 * 6;

            // draw days of week header

            ctx.fillStyle = this.options.dayHeaderFontColor;
            ctx.font = '10pt Arial';

            ctx.fillText('Sun', 2, 13);
            ctx.fillText('Mon', locationOneX + 2, 13);
            ctx.fillText('Tue', locationTwoX + 2, 13);
            ctx.fillText('Wed', locationThreeX + 2, 13);
            ctx.fillText('Thu', locationFourX + 2, 13);
            ctx.fillText('Fri', locationFiveX + 2, 13);
            ctx.fillText('Sat', locationSixX + 2, 13);

            ctx.lineWidth = 2;
            ctx.strokeStyle = this.options.gridColor;

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

            let themonth = new moment();

            themonth = moment().year(this.currentYear).month(this.currentMonth).date(1);
            let originalstartday = moment(themonth);

            let firstDayOfMonthWeekDay = themonth.weekday();

            if (firstDayOfMonthWeekDay != 0) // we are not sunday
            {
                while (firstDayOfMonthWeekDay != 0)
                {
                    themonth.subtract(1, 'days');
                    firstDayOfMonthWeekDay = themonth.weekday();
                }
            }

            // themonth should now be set to the first Sunday on our calendar

            // draw all of our days

            // week 0

            ctx.fillText(themonth.date(), 2, headerheight + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(0, headerheight, locationOneX, locationOneY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationOneX + 2, headerheight + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationOneX, headerheight, locationTwoX, locationOneY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationTwoX + 2, headerheight + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationTwoX, headerheight, locationThreeX, locationOneY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationThreeX + 2, headerheight + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationThreeX, headerheight, locationFourX, locationOneY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationFourX + 2, headerheight + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFourX, headerheight, locationFiveX, locationOneY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationFiveX + 2, headerheight + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFiveX, headerheight, locationSixX, locationOneY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationSixX + 2, headerheight + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationSixX, headerheight, canvaswidth, locationOneY, moment(themonth)));
            themonth.add(1 , 'days');

            // week 1

            ctx.fillText(themonth.date(), 2, locationOneY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(0, locationOneY, locationOneX, locationTwoY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationOneX + 2, locationOneY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationOneX, locationOneY, locationTwoX, locationTwoY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationTwoX + 2, locationOneY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationTwoX, locationOneY, locationThreeX, locationTwoY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationThreeX + 2, locationOneY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationThreeX, locationOneY, locationFourX, locationTwoY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationFourX + 2, locationOneY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFourX, locationOneY, locationFiveX, locationTwoY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationFiveX + 2, locationOneY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFiveX, locationOneY, locationSixX, locationTwoY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationSixX + 2, locationOneY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationSixX, locationOneY, canvaswidth, locationTwoY, moment(themonth)));
            themonth.add(1 , 'days');

            // week 2

            ctx.fillText(themonth.date(), 2, locationTwoY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(0, locationTwoY, locationOneX, locationThreeY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationOneX + 2, locationTwoY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationOneX, locationTwoY, locationTwoX, locationThreeY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationTwoX + 2, locationTwoY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationTwoX, locationTwoY, locationThreeX, locationThreeY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationThreeX + 2, locationTwoY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationThreeX, locationTwoY, locationFourX, locationThreeY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationFourX + 2, locationTwoY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFourX, locationTwoY, locationFiveX, locationThreeY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationFiveX + 2, locationTwoY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFiveX, locationTwoY, locationSixX, locationThreeY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationSixX + 2, locationTwoY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationSixX, locationTwoY, canvaswidth, locationThreeY, moment(themonth)));
            themonth.add(1 , 'days');

            // week 3

            ctx.fillText(themonth.date(), 2, locationThreeY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(0, locationThreeY, locationOneX, locationFourY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationOneX + 2, locationThreeY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationOneX, locationThreeY, locationTwoX, locationFourY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationTwoX + 2, locationThreeY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationTwoX, locationThreeY, locationThreeX, locationFourY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationThreeX + 2, locationThreeY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationThreeX, locationThreeY, locationFourX, locationFourY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationFourX + 2, locationThreeY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFourX, locationThreeY, locationFiveX, locationFourY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationFiveX + 2, locationThreeY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFiveX, locationThreeY, locationSixX, locationFourY, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationSixX + 2, locationThreeY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationSixX, locationThreeY, canvaswidth, locationFourY, moment(themonth)));
            themonth.add(1 , 'days');

            // week 4

            ctx.fillText(themonth.date(), 2, locationFourY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(0, locationFourY, locationOneX, canvasheight + headerheight, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationOneX + 2, locationFourY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationOneX, locationFourY, locationTwoX, canvasheight + headerheight, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationTwoX + 2, locationFourY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationTwoX, locationFourY, locationThreeX, canvasheight + headerheight, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationThreeX + 2, locationFourY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationThreeX, locationFourY, locationFourX, canvasheight + headerheight, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationFourX + 2, locationFourY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFourX, locationFourY, locationFiveX, canvasheight + headerheight, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationFiveX + 2, locationFourY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationFiveX, locationFourY, locationSixX, canvasheight + headerheight, moment(themonth)));
            themonth.add(1 , 'days');

            ctx.fillText(themonth.date(), locationSixX + 2, locationFourY + 13);
            this.arrayCalendarDateBoxes.push(new CalendarDateBox(locationSixX, locationFourY, canvaswidth, canvasheight + headerheight, moment(themonth)));
            themonth.add(1 , 'days');

            // draw appointments

            themonth = originalstartday;

            let maxCalendarBoxEntries = this.retrieveMaxCalendarBoxEntries(this.arrayCalendarDateBoxes[0]);

            $.each(this.arrayCalendarDateBoxes, function(itemindex, calendarDateBox) {
                self.drawCalendarBoxEntries(calendarDateBox, maxCalendarBoxEntries, ctx);
            });

            // more box if showing

            if (self.isMoreShowing == true)
            {
                let canvasCenterX = canvaswidth / 2;
                let canvasCenterY = canvasheight / 2;
                let heightCalendarEntry = 20;
                let widthCalendarEntry = self.arrayCalendarDateBoxes[0].right - self.arrayCalendarDateBoxes[0].left;
                let leftMoreBox = canvasCenterX - ((widthCalendarEntry) + 6);  // cals 2 pixs space on left, middle, right and 2 entries per row
                let topMoreBox = heightCalendarEntry;
                let rightMoreBox = (canvasCenterX - leftMoreBox) + canvasCenterX;
                let bottomMoreBox = canvasheight - heightCalendarEntry;

                ctx.beginPath();
                ctx.rect(leftMoreBox, heightCalendarEntry, rightMoreBox - leftMoreBox, bottomMoreBox - topMoreBox);
                ctx.fillStyle = self.options.backColor;
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'black';
                ctx.stroke();

                let arrayAppointments = this.retrieveAppointmentsForGivenDate(self.moreShowingDate);

                let currentY = self.heightCalendarBoxEntry + 2;
                let xLeft = leftMoreBox + 2; // offset our entries in the box with 2 pixels on the left and right
                let xRight = xLeft + widthCalendarEntry;

                let maxMoreBoxEntries = (bottomMoreBox - topMoreBox) / (self.heightCalendarBoxEntry + 1);

                let maxEntriestoDraw = maxMoreBoxEntries; // remove one for the + more at the bottom
                maxEntriestoDraw = Math.floor(maxEntriestoDraw);
                let maxEntriesPerColumn = maxEntriestoDraw;
                maxEntriestoDraw = maxEntriestoDraw * 2;

                $.each(arrayAppointments, function(index, appointment) {
                    if (maxEntriestoDraw > 0)
                    {
                        // draw our appointment rect

                        ctx.beginPath();
                        ctx.rect(xLeft, currentY, widthCalendarEntry, self.heightCalendarBoxEntry);
                        ctx.fillStyle = appointment.color;
                        ctx.fill();
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = 'black';
                        ctx.stroke();

                        let aCalendarBoxDate = new CalendarDateBox(0,0,0,0, appointment.fromDateTime);

                        let aCalendarDateBoxEntry = new CalendarDateBoxEntry(xLeft, currentY, xRight, currentY + self.heightCalendarBoxEntry, aCalendarBoxDate, false, appointment);
                        self.arrayMoreCalendarDateBoxEntries.push(aCalendarDateBoxEntry);

                        // draw appointment text

                        ctx.fillStyle = 'black';
                        ctx.font = '10pt Arial';

                        ctx.fillText(self.fitString(ctx, appointment.title, widthCalendarEntry), xLeft + 2, currentY + self.heightCalendarBoxEntry - 4);

                        currentY += self.heightCalendarBoxEntry;
                        maxEntriestoDraw--;

                        if (maxEntriestoDraw == maxEntriesPerColumn)
                        {
                            xLeft = xLeft + widthCalendarEntry + 7;
                            xRight = xLeft + widthCalendarEntry;
                            currentY = self.heightCalendarBoxEntry + 2;
                        }
                    }
                });

                $(this.canvas).unbind('click').bind('click', function(event) {

                    for (let i = 0; i < self.arrayMoreCalendarDateBoxEntries.length; i++) {

                        let xyVal = self.getMousePos(self.canvas, event);

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
            else // if more is not showing we setup click handlers for the calendar boxes
            {
                $(this.canvas).unbind('click').bind('click', function(event) {

                    for (let i = 0; i < self.arrayCalendarDateBoxEntries.length; i++) {

                        let xyVal = self.getMousePos(self.canvas, event);

                        if ((xyVal.x >= self.arrayCalendarDateBoxEntries[i].left) &&
                            (xyVal.x <= self.arrayCalendarDateBoxEntries[i].right) &&
                            (xyVal.y >= self.arrayCalendarDateBoxEntries[i].top) &&
                            (xyVal.y <= self.arrayCalendarDateBoxEntries[i].bottom)) {

                            if (self.arrayCalendarDateBoxEntries[i].isMoreBox == true)
                            {
                                self.appointmentClickCallBack(true, self.arrayCalendarDateBoxEntries[i].calendarDateBox.boxDate, null);
                                self.isMoreShowing = true;
                                self.moreShowingDate = self.arrayCalendarDateBoxEntries[i].calendarDateBox.boxDate;
                                self.draw();
                            }
                            else
                            {
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
        else // draw the day view
        {
            // draw background

            ctx.fillStyle = this.options.backColor;
            ctx.fillRect(0, 0, canvaswidth, canvasheight);

            // pull appointments for the current day selected in our control

            let todayMoment = new moment();
            todayMoment = moment().year(self.currentYear).month(self.currentMonth).date(self.currentDay);

            let arrayTodaysAppointments = this.retrieveAppointmentsForGivenDate(todayMoment);

            let currentY = 2;

            // draw appointments - all day

            $.each(arrayTodaysAppointments, function(index, appointment) {
                if (appointment.isAllDay == true) {

                    // draw our appointment rect

                    ctx.beginPath();
                    ctx.rect(2, currentY, canvaswidth - 4, self.heightCalendarBoxEntry);
                    ctx.fillStyle = appointment.color;
                    ctx.fill();
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'black';
                    ctx.stroke();

                    let aDayViewBoxEntry = new DayViewBoxEntry(2, currentY, canvaswidth - 4, currentY + self.heightCalendarBoxEntry, appointment);
                    self.arrayDayViewBoxEntry.push(aDayViewBoxEntry);

                    // draw appointment text

                    ctx.fillStyle = 'black';
                    ctx.font = '10pt Arial';

                    ctx.fillText(self.fitString(ctx, appointment.title, canvaswidth - 4), 2 + 2, currentY + self.heightCalendarBoxEntry - 4);

                    currentY += self.heightCalendarBoxEntry + 2;
                }
            });

            currentY += 3; // space 3 down from all day items to schedule

            // draw our day view appointment time slots!

            let startdayminute = 0 * 60;
            let enddayminute = 24 * 60;
            let minutedayspan = enddayminute - startdayminute;

            let pixelsperminutey = (canvasheight - currentY) / minutedayspan;

            // draw appointments - with start and end time

            $.each(arrayTodaysAppointments, function(index, appointment) {
                if (appointment.isAllDay == false) {

                    let startminute = (appointment.fromDateTime.hour()) * 60;
                    startminute = startminute + appointment.fromDateTime.minute();

                    let endminute = (appointment.toDateTime.hour()) * 60;
                    endminute = endminute + appointment.toDateTime.minute();

                    let offset = 50;
                    ctx.fillStyle = appointment.color;
                    ctx.fillRect(offset, currentY + (startminute * pixelsperminutey), canvaswidth - offset, ((endminute - startminute) * pixelsperminutey));

                    ctx.font = "14px Arial";
                    ctx.fillStyle = "black";
                    ctx.fillText(self.fitString(ctx, appointment.title, canvaswidth - offset), offset + 2, currentY + (startminute * pixelsperminutey) + 15, canvaswidth - offset /* offset */);

                    let aDayViewBoxEntry = new DayViewBoxEntry(offset, currentY + (startminute * pixelsperminutey), canvaswidth - offset, currentY + (endminute * pixelsperminutey), appointment);
                    self.arrayDayViewBoxEntry.push(aDayViewBoxEntry);
                }
            });

            // draw scale over everything previous

            for (let i = 0; i < 24 - 0; i++)
            {
                ctx.beginPath();
                ctx.moveTo(0, currentY + ((i * 60) * pixelsperminutey));
                ctx.lineTo(canvaswidth, currentY + ((i * 60) * pixelsperminutey));
                ctx.stroke();

                let currenthour = 0 + i;
                let ampm = ' am';

                if (currenthour > 12)
                {
                    currenthour = currenthour - 12;
                    ampm = ' pm';
                }

                if (currenthour == 0)
                {
                    currenthour = 12;
                    ampm = ' am';
                }

                ctx.font = "14px Arial";
                ctx.fillStyle = "black";
                ctx.fillText(currenthour + ampm, 2, currentY + ((i * 60) * pixelsperminutey + 15) /* offset */);
            }

            $(this.canvas).unbind('click').bind('click', function(event) {

                for (let i = 0; i < self.arrayDayViewBoxEntry.length; i++) {

                    let xyVal = self.getMousePos(self.canvas, event);

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

    }

    public constructor(canvas: any, options: MonthScheduleViewControlOptions) {
        this.canvas = canvas;
        this.options = options;
        this.draw();
    }

    public setAppointmentClickCallback(func : any)
    {
        this.appointmentClickCallBack = func;
    }

    public setViewMode(viewMode : ViewMode)
    {
        this.options.viewMode = viewMode;
        this.draw();
    }

    public setYearAndMonth(year: number, month : string)
    {
        this.currentYear = year;
        this.currentMonth = month;
        this.draw();
    }

    public setDay(day : number)
    {
        this.currentDay = day;
        this.draw();
    }

    public setHeight(height: number)
    {
        this.canvas.height = height;
        this.draw();
    }

    public setWidth(width: number)
    {
        this.canvas.width = width;
        this.draw();
    }

    public addAppointment(aAppointment: Appointment)
    {
        this.arrayAppointments.push(aAppointment);
        this.draw();
    }

    public deleteAppointment(index: number)
    {
        this.arrayAppointments.splice(index, 1);
        this.draw();
    }

    public retrieveAppointments()
    {
        return this.arrayAppointments;
    }

    public retrieveAppointmentCount()
    {
        return this.arrayAppointments.length;
    }
}