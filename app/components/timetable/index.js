import React from 'react';
import STYLE from './style.css';
import SBHSStore from '../../stores/sbhs';
import Centered from '../centered';
import SBHSException from '../sbhs-exception';
import Loader from '../loader';
import { SettingsStore } from '../../stores/settings';
import { Assessments } from '../assessments/assessments';
import { WEEKDAYS, WEEKS } from '../../data/day-constants';
import { PRIMARY_COLOR_CSS, ThemeContext } from '../themes';

const LOGIN_MESSAGE = <span>
  <a onClick={() => window.location.href = '/auth/login'}>Login</a> to load your timetable!
</span>;

export default class Timetable extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState();
  }

  static contextType = ThemeContext;

  getInitialState() {
    let weekday = WEEKDAYS[0], week = WEEKS[0];
    if (SBHSStore.today && SBHSStore.today.day) {
      let components = SBHSStore.today.day.split(' ');
      weekday = components[0];
      week = components[1];
    }

    return {
      days: null,
      weekday: weekday,
      week: week
    };
  }

  getData = () => {
    this.setState({
      days: (SBHSStore.timetable || {}).days
    });
  };

  componentWillMount() {
    SBHSStore.bind('timetable', this.getData);
    this.getData();
  }

  componentWillUnmount() {
    SBHSStore.unbind('timetable', this.getData);
  }

  render() {
    if (!this.state.days)
      return <Centered vertical horizontal>
        <SBHSException
          loading={<Loader/>}
          loggedOut={LOGIN_MESSAGE}
          offline='Go online to load your timetable!'/>
      </Centered>;

    let day = this.state.weekday + ' ' + this.state.week, periods;
    let currentDay = null;
    if (this.state.days) {
      for (let i = this.state.days.length; i--;) {
        if (this.state.days[i].day === day) {
          periods = this.state.days[i].periods;
          currentDay = this.state.days[i];
          break;
        }
      }
    }

    if (currentDay && SettingsStore.showAssessments) {
      periods = (Assessments.updateTimetable(periods, currentDay.dayNumber))
    }

    const hasTheme = this.context && this.context.details;
    const primaryColor = hasTheme ? this.context.details.primaryColor : null;

    return <Centered horizontal vertical>
      <div className={STYLE.controls}>
        <div className={STYLE.row}>
          {WEEKDAYS.map((weekday, i) =>
            <div
              key={i}
              className={STYLE.control}
              style={this.state.weekday == weekday ? (primaryColor ? {color: PRIMARY_COLOR_CSS} : {'color': '#00BFFF'}) : null}
              onClick={() => this.setState({weekday: weekday})}>
              {weekday[0]}
            </div>)}
        </div>
        <div className={STYLE.row}>
          {WEEKS.map((week, i) =>
            <div
              key={i}
              className={STYLE.control}
              style={this.state.week == week ? (primaryColor ? {color: PRIMARY_COLOR_CSS} : {'color': '#00BFFF'}) : null}
              onClick={() => this.setState({week: week})}>
              {week}
            </div>)}
        </div>
      </div>

      {periods ? <div className={STYLE.timetable}>
        {periods.map((period, i) => {
          return <div key={i} className={STYLE.period}>
            <div style={{'fontSize': '1.2em', 'color': period.title ? null : '#AAA'}}>
              {period.title || 'Free Period'}

              {period.isAssessment ? (
                <div style={{'fontSize': '.8em', 'color': '#AAA', paddingTop: '.2em'}}>
                  {period.time ? period.time : null}{period.toRaw ? (period.time ? ' - ' : '') + period.toRaw : null}
                </div>
              ) : null}
            </div>

            <div style={{'fontSize': '1.5em'}}>{period.room || ''}</div>
          </div>;
        })}
      </div> : null}
    </Centered>;
  }
}