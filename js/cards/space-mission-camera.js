window.PLANETENUHR_SPACE_MISSION_CAMERA = (() => {
  'use strict';

  const topDown = {right:[1,0,0],up:[0,1,0],front:[0,0,1]};

  /** Creates the default orientation, magnification and offset. @returns {object} Camera state. */
  function standard() {
    return {yaw:0,pitch:0,zoom:1,x:0,y:0};
  }

  /** Projects an ecliptic vector relative to the camera.
   * @param {number[]} point Ecliptic x, y and z.
   * @param {object} axes Right, up and front basis vectors of the original view.
   * @param {object} camera Camera orientation, magnification and offset.
   * @param {number} scale SVG units per coordinate unit at standard magnification.
   * @returns {number[]} SVG x/y and signed depth toward the viewer.
   */
  function project([x,y,z],axes,camera,scale) {
    const right = axes.right[0] * x + axes.right[1] * y + axes.right[2] * z;
    const up = axes.up[0] * x + axes.up[1] * y + axes.up[2] * z;
    const front = axes.front[0] * x + axes.front[1] * y + axes.front[2] * z;
    const cosYaw = Math.cos(camera.yaw);
    const sinYaw = Math.sin(camera.yaw);
    const cosPitch = Math.cos(camera.pitch);
    const sinPitch = Math.sin(camera.pitch);
    const horizontal = right * cosYaw - front * sinYaw;
    const depth = right * sinYaw + front * cosYaw;
    const vertical = up * cosPitch - depth * sinPitch;
    const factor = scale * camera.zoom;
    return [320 + camera.x + horizontal * factor,200 + camera.y - vertical * factor,
      up * sinPitch + depth * cosPitch];
  }

  /** Changes magnification around a fixed point in the plot.
   * @param {object} camera Mutable camera state. @param {number} multiplier Zoom multiplier.
   * @param {number} [x=320] Anchor x. @param {number} [y=200] Anchor y. @returns {void}
   */
  function zoomAt(camera,multiplier,x = 320,y = 200) {
    const zoom = Math.min(20,Math.max(.3,camera.zoom * multiplier));
    const factor = zoom / camera.zoom;
    camera.x = x - 320 - (x - 320 - camera.x) * factor;
    camera.y = y - 200 - (y - 200 - camera.y) * factor;
    camera.zoom = zoom;
  }

  /** Connects pointer, wheel and keyboard gestures to the 3D plot.
   * @param {SVGSVGElement} plot Focusable plot in the modal.
   * @param {Function} getCamera Reads the active camera state.
   * @param {Function} redraw Schedules a redraw.
   * @returns {Function} Clears an interrupted gesture when the dialog closes.
   */
  function bind(plot,getCamera,redraw) {
    const pointers = new Map();
    const window = plot.ownerDocument.defaultView;

    /** Converts client coordinates to the plot's fixed SVG units.
     * @param {PointerEvent|WheelEvent} event Pointer coordinates. @returns {DOMPoint}
     */
    function pointAt(event) {
      return new window.DOMPoint(event.clientX,event.clientY).matrixTransform(plot.getScreenCTM().inverse());
    }

    /** Applies an orbit around the scene center.
     * @param {object} camera Mutable camera. @param {number} dx Horizontal delta.
     * @param {number} dy Vertical delta. @returns {void}
     */
    function rotate(camera,dx,dy) {
      camera.yaw = (camera.yaw + dx * .008) % (2 * Math.PI);
      camera.pitch = (camera.pitch + dy * .008) % (2 * Math.PI);
    }

    plot.addEventListener('pointerdown',event => {
      if (event.button !== 0 && event.button !== 2) return;
      pointers.set(event.pointerId,{point:pointAt(event),pan:event.button === 2 || event.shiftKey});
      if (event.isTrusted) plot.setPointerCapture(event.pointerId);
    });
    plot.addEventListener('pointermove',event => {
      const previous = pointers.get(event.pointerId);
      const camera = getCamera();
      if (!previous || !camera) return;
      const point = pointAt(event);
      const dx = point.x - previous.point.x;
      const dy = point.y - previous.point.y;
      if (pointers.size === 1) {
        if (previous.pan || event.shiftKey) {
          camera.x += dx;
          camera.y += dy;
        } else {
          rotate(camera,dx,dy);
        }
      } else if (pointers.size === 2) {
        for (const [id,other] of pointers) {
          if (id === event.pointerId) continue;
          const {x,y} = other.point;
          const before = Math.hypot(previous.point.x - x,previous.point.y - y);
          const after = Math.hypot(point.x - x,point.y - y);
          if (before > 1) zoomAt(camera,after / before,(previous.point.x + x) / 2,(previous.point.y + y) / 2);
          camera.x += dx / 2;
          camera.y += dy / 2;
        }
      }
      previous.point = point;
      redraw();
    });
    for (const type of ['pointerup','pointercancel','lostpointercapture']) {
      plot.addEventListener(type,event => pointers.delete(event.pointerId));
    }
    plot.addEventListener('contextmenu',event => event.preventDefault());
    plot.addEventListener('wheel',event => {
      const camera = getCamera();
      if (!camera) return;
      event.preventDefault();
      let delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      if (event.deltaMode === 2) delta *= 400;
      const point = pointAt(event);
      zoomAt(camera,Math.exp(-delta * .0015),point.x,point.y);
      redraw();
    },{passive:false});
    plot.addEventListener('keydown',event => {
      const camera = getCamera();
      if (!camera) return;
      let dx = 0;
      let dy = 0;
      switch (event.key) {
        case 'ArrowLeft': dx = -18; break;
        case 'ArrowRight': dx = 18; break;
        case 'ArrowUp': dy = -18; break;
        case 'ArrowDown': dy = 18; break;
        case '+':
        case '=': zoomAt(camera,1.25); break;
        case '-': zoomAt(camera,.8); break;
        default: return;
      }
      if (event.shiftKey) {
        camera.x += dx;
        camera.y += dy;
      } else {
        rotate(camera,dx,dy);
      }
      event.preventDefault();
      redraw();
    });
    return () => pointers.clear();
  }

  return {topDown,standard,project,zoomAt,bind};
})();
