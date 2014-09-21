"use strict";

define([], function(){
  function timelineEventZipper() {
    var toDate = function (value) {
      if (value instanceof Date) {
        return value;
      } else if (typeof value === 'number' || typeof value === 'string') {
        return new Date(value);
      } else {
        return null;
      }
    };
    var cmp = function (a, b) {
      return a === b ? 0 : a < b ? -1 : 1;
    };
    var getEventDate = function (event) {
      if (event.createdDate) {
        return toDate(event.createdDate);
      } else if (event.startDate) {
        return toDate(event.startDate);
      } else if (event.endDate) {
        return toDate(event.endDate);
      } else {
        return null;
      }
    };
    var sortByDate = function (items) {
      items.sort(function (a, b) {
        return cmp(a.date, b.date);
      });
    };
    var makeEvent = function (type, value, date) {
      return {
        type: type,
        value: value,
        date: date
      };
    };
    var calculateMomentType = function (moment) {
      if (moment.imageUrl) {
        return 'image';
      } else {
        return 'message';
      }
    };
    var momentToEvent = function (moment) {
      return makeEvent(calculateMomentType(moment), moment, getEventDate(moment));
    };
    var milestoneToEvent = function (milestone) {
      return makeEvent('milestone', milestone, getEventDate(milestone));
    };
    var zip = function (moments, milestones, descending) {
      var events = moments.map(momentToEvent).concat(milestones.map(milestoneToEvent));
      sortByDate(events);
      if (descending) {
        events.reverse();
      }
      return events;
    };
    this.zip = function (moments, milestones, descending) {
      return zip(
        moments || [],
        milestones || [],
        !!descending);
    };
  }

  return [timelineEventZipper];
});