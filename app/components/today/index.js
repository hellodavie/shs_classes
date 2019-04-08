import React from 'react';
import createReactClass from 'create-react-class';

import SBHSStore from '../../stores/sbhs';
import Centered from '../centered';
import Countdown from '../countdown';
import Loader from '../loader';

import parseTime from '../../utilities/parse-time';

import STYLE from './style.css';

import SettingsStore from '../../stores/settings';
import { Assessments } from '../assessments/assessments';

const VARIATION_COLOR = '#00BFFF';

const BREAKS = ['Lunch 1', 'Recess'];

function filterClasses(bells) {
  if (SettingsStore.showBreaks) {
    return bells.filter(bell => bell.isPeriod || BREAKS.includes(bell.title))
  } else {
    return bells.filter(bell => bell.isPeriod)
  }
}

export default createReactClass({
  getInitialState() {
    return {
      bells: null,
      periods: null,
      date: null,
      dateRaw: null,

      nextTime: null,
      nextBell: null
    };
  },

  getData() {
    if (SBHSStore.today) {
      this.setState({
        bells: SBHSStore.today.bells,
        periods: filterClasses(SBHSStore.today.bells),
        date: SBHSStore.today.date,
        dateRaw: SBHSStore.today.dateRaw
      }, this.getNext);
    }
  },

  getNext() {
    let bells = this.state.bells;

    if (bells) {
      const date = new Date(this.state.date);
      const now = Date.now();

      this.getAssessments();

      for (let i = 0; i < bells.length; i++) {
        let bell = bells[i];
        parseTime(date, bell.time);

        if (date > now) {
          return this.setState({
            nextBell: bell,
            nextTime: date
          });
        }
      }
    }

    this.setState({
      nextBell: null,
      nextTime: null
    });
  },

  getAssessments() {
    const bells = this.state.bells;
    if (SettingsStore.showAssessments && bells) {
      const periods = this.state.periods;
      if (Assessments.update(bells, this.state.date, this.state.dateRaw, periods)) {
        console.log(bells);
        this.setState({bells, periods})
      }
    }
  },

  onCalendarFetch() {
    this.getAssessments()
  },

  componentWillMount() {
    SBHSStore.bind('today', this.getData);
    SBHSStore.bind('calendar', this.onCalendarFetch);
    this.getData();
  },

  componentWillUnmount() {
    SBHSStore.unbind('today', this.getData);
    SBHSStore.unbind('calendar', this.onCalendarFetch);
  },

  render() {
    let {periods, nextBell, nextTime} = this.state,
      simple = !periods.some(e => e.room);

    return <Centered vertical horizontal>
      {nextBell ? <div className={STYLE.next}>
        <span style={{'fontSize': '1.5em'}}>{nextBell.title}</span> in
        <Countdown
          to={nextTime}
          className={STYLE.countdown}
          onComplete={this.getNext}/>
      </div> : <Loader/>}

      {periods.length ? <div className={STYLE.today}>
        {periods.map((bell, i) => {
          if (simple) {
            return <div key={i} className={STYLE.period}>
              <div style={{
                'flexGrow': '1',
                'fontSize': '1.5em',
                'color': bell.variations.indexOf('title') < 0 ? '#757575' : VARIATION_COLOR
              }}>
                {bell.title}
              </div>
              <div style={{
                'fontSize': '1.5em',
                'color': bell.variations.indexOf('time') < 0 ? null : VARIATION_COLOR
              }}>
                {bell.time}
              </div>
            </div>;
          }

          if (!bell.room) {
            return <div
              key={i}
              className={STYLE.period}
              style={{'color': '#757575'}}>
              <div style={{
                'flexGrow': '1',
                'fontSize': '1.2em',
                'marginBottom': '0.3em',
                'color': bell.variations.indexOf('title') < 0 ? null : VARIATION_COLOR
              }}>
                {bell.title}
              </div>
              <div style={{
                'fontSize': '1.2em',
                'color': bell.variations.indexOf('time') < 0 ? null : VARIATION_COLOR
              }}>
                {bell.time}
              </div>
            </div>;
          }

          return <div key={i} className={STYLE.period}>
            <div style={{'flexGrow': '1'}}>
              <div style={{
                'fontSize': '1.2em',
                'marginBottom': '0.3em',
                'color': bell.variations.indexOf('title') < 0 ? null : VARIATION_COLOR
              }}>{bell.title}</div>
              <div style={{'fontSize': '0.9em'}}>
                <span>
                  {'at '}
                  <span style={{'color': bell.variations.indexOf('time') < 0 ? null : VARIATION_COLOR}}>
                    {bell.time || 'the time of reckoning'}
                  </span>
                </span>
                {' '}
                <span style={{'color': '#757575'}}>
                  {'with '}
                  <span style={{'color': bell.variations.indexOf('teacher') < 0 ? null : VARIATION_COLOR}}>
                    {bell.teacher || 'no one'}
                  </span>
                </span>
              </div>
            </div>
            <div style={{
              'fontSize': '1.5em',
              'color': bell.variations.indexOf('room') < 0 ? null : VARIATION_COLOR
            }}>{bell.room}
            </div>
          </div>;
        })}
      </div> : null}
    </Centered>;
  }
});