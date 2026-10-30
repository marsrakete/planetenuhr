window.PLANETENUHR_DASHBOARD_ERRORS = (() => {
  'use strict';

  /** Installs the dashboard-wide error handler on the supplied browser window.
   * @param {object} dependencies Window, alert and console interfaces.
   * @returns {Function} Installed window error handler.
   */
  function install(dependencies){
    const errorWindow = dependencies.window;
    const showAlert = dependencies.alert;
    const logger = dependencies.console;
    errorWindow.onerror = (message, source, line, column, error) => handleDashboardError(
      message, source, line, column, error, showAlert, logger
    );
    return errorWindow.onerror;
  }

  /** Keeps the two known ResizeObserver delivery warnings out of blocking alerts.
   * @param {string|Event} message Browser error message or event.
   * @param {string} source Source URL supplied by the browser.
   * @param {number} line Source line number.
   * @param {number} column Source column number.
   * @param {Error|null} error Original error, when available.
   * @param {Function} showAlert Alert function for other errors.
   * @param {object} logger Console interface for warning output.
   * @returns {boolean} True only for the two known ResizeObserver delivery warnings.
   */
  function handleDashboardError(message, source, line, column, error, showAlert, logger){
    if (message === 'ResizeObserver loop completed with undelivered notifications.' ||
        message === 'ResizeObserver loop limit exceeded') {
      logger.warn(message);
      return true;
    }
    showAlert('JS Error: ' + message + ' @ ' + line);
    return false;
  }

  return {install, handleDashboardError};
})();
