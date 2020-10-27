import { Directive, Input, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSvgIcon]'
})
export class SvgIconDirective implements OnInit {
  @Input() public svgString: string;
  public svgObject: object = {};

  constructor(private el: ElementRef, private renderer: Renderer2) {
   }

   ngOnInit() {
    let selectedSvg = this.getSvg(this.svgString);
    selectedSvg = new DOMParser().parseFromString(selectedSvg, 'text/html');
    if (selectedSvg) {
      this.renderer.appendChild(this.el.nativeElement, selectedSvg.body.firstChild);
    }

   }

  //  setSvg(svgString) {
  //    this.el.nativeElement.appendChild(this)

  //  }

  getSvg(svgString) {
    // tslint:disable-next-line:no-string-literal
    this.svgObject['profileSvg'] = `<svg version="1.1" width="110" fill="#3f51b5" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      viewBox="0 0 402.161 402.161" style="enable-background:new 0 0 402.161 402.161;" xml:space="preserve">
      <g>
      <g>
        <g>
          <path d="M201.08,49.778c-38.794,0-70.355,31.561-70.355,70.355c0,18.828,7.425,40.193,19.862,57.151
            c14.067,19.181,32,29.745,50.493,29.745c18.494,0,36.426-10.563,50.494-29.745c12.437-16.958,19.862-38.323,19.862-57.151
            C271.436,81.339,239.874,49.778,201.08,49.778z M201.08,192.029c-13.396,0-27.391-8.607-38.397-23.616
            c-10.46-14.262-16.958-32.762-16.958-48.28c0-30.523,24.832-55.355,55.355-55.355s55.355,24.832,55.355,55.355
            C256.436,151.824,230.372,192.029,201.08,192.029z"/>
          <path d="M201.08,0C109.387,0,34.788,74.598,34.788,166.292c0,91.693,74.598,166.292,166.292,166.292
            s166.292-74.598,166.292-166.292C367.372,74.598,292.773,0,201.08,0z M201.08,317.584c-30.099-0.001-58.171-8.839-81.763-24.052
            c0.82-22.969,11.218-44.503,28.824-59.454c6.996-5.941,17.212-6.59,25.422-1.615c8.868,5.374,18.127,8.099,27.52,8.099
            c9.391,0,18.647-2.724,27.511-8.095c8.201-4.97,18.39-4.345,25.353,1.555c17.619,14.93,28.076,36.526,28.895,59.512
            C259.25,308.746,231.178,317.584,201.08,317.584z M296.981,283.218c-3.239-23.483-15.011-45.111-33.337-60.64
            c-11.89-10.074-29.1-11.256-42.824-2.939c-12.974,7.861-26.506,7.86-39.483-0.004c-13.74-8.327-30.981-7.116-42.906,3.01
            c-18.31,15.549-30.035,37.115-33.265,60.563c-33.789-27.77-55.378-69.868-55.378-116.915C49.788,82.869,117.658,15,201.08,15
            c83.423,0,151.292,67.869,151.292,151.292C352.372,213.345,330.778,255.448,296.981,283.218z"/>
          <path d="M302.806,352.372H99.354c-4.142,0-7.5,3.358-7.5,7.5c0,4.142,3.358,7.5,7.5,7.5h203.452c4.142,0,7.5-3.358,7.5-7.5
            C310.307,355.73,306.948,352.372,302.806,352.372z"/>
          <path d="M302.806,387.161H99.354c-4.142,0-7.5,3.358-7.5,7.5c0,4.142,3.358,7.5,7.5,7.5h203.452c4.142,0,7.5-3.358,7.5-7.5
            C310.307,390.519,306.948,387.161,302.806,387.161z"/>
        </g>
      </g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
    </svg>`;
    // this.svgObject['profilePicture'] = `<svg aria-label="Profile picture actions" class="pzggbiyp" data-visualcompletion="ignore-dynamic"
    //   role="img" style="height: 168px; width: 168px;"><mask id="jsc_c_5r"><circle cx="84" cy="84" fill="white" r="84"></circle></mask>
    //   <g mask="url(#jsc_c_5r)">
    //   <image x="0" y="0" height="100%" preserveAspectRatio="xMidYMid slice" width="100%"
    //   xlink:href="./../../assets/profile_pic_male.jpg" style="height: 168px; width: 168px;">
    //   </image>
    //   <circle class="mlqo0dh0 georvekb s6kb5r3f" cx="84" cy="84"
    //   r="84"></circle></g></svg>`;
    this.svgObject['uploadPicture'] = `<svg class="gb_pb" enable-background="new 0 0 24 24" focusable="false" height="26" viewBox="0 0 24 24"
    width="18" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path
    d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14H4V7h16v12zM12 9c-2.21 0-4 1.79-4
    4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"></path></svg>`;
    return this.svgObject[svgString];
  }


}
