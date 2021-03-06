import ReactGA from 'react-ga';

const GA_TRACKING_ID = 'UA-130596833-2';

export function initialiseAnalytics() {
  ReactGA.initialize(GA_TRACKING_ID);
  setDimension('dimension2', APP_VERSION);
}

export function pageView(pathname) {
  ReactGA.pageview((pathname || window.location.pathname) + window.location.search);
}

function setDimension(dimensionName, data) {
  ReactGA.set({[dimensionName]: data});
}

export function collectUserGrade(grade) {
  setDimension('dimension1', grade);
}
