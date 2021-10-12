import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';
import { createEventUrl_test } from '../app.config';
import { MapDetails, Address } from '../user-type';

// import tt from '@tomtom-international/web-sdk-maps';
import { services } from '@tomtom-international/web-sdk-services';
import SearchBox from '@tomtom-international/web-sdk-plugin-searchbox';
import { CommonService } from '../common.service';

@Component({
  selector: 'app-tom-tom-map',
  templateUrl: './tom-tom-map.component.html',
  styleUrls: ['./tom-tom-map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TomTomMapComponent implements OnInit, OnChanges {
  public tomTomMap;
  public coordinates: MapDetails;
  public marker: any;
  public popup = new tt.Popup({
    offset: 35
});
  public inputSearchOptions = {
    searchOptions: {
        key: '77h32Lz4APdVGWZEPJ5VtJOg5GFXpyKV',
        language: 'en-GB',
        limit: 5
    },
    autocompleteOptions: {
        key: '77h32Lz4APdVGWZEPJ5VtJOg5GFXpyKV',
        language: 'en-GB'
    }
};
public addressFrmApi: Address;

@Input('latlng') public latlng;
@Output('locationDetails') public locationDetails = new EventEmitter<object>();
// @Output('addressDetails') public addressDetails = new EventEmitter<Address>();

  constructor(private commonService: CommonService) { }

  ngOnInit(): void {
    this.initializeTomTom();
  }

  ngOnChanges(): void {
    if (this.tomTomMap) {
      this.tomTomMap.setCenter(this.latlng ? [this.latlng.longitude, this.latlng.latitude] : [72.82118, 18.96905]);
    } else {
      this.initializeTomTom();
    }
  }

  private initializeTomTom(): void {
    const isMobile: boolean = false;
    this.tomTomMap = tt.map({
      key: '77h32Lz4APdVGWZEPJ5VtJOg5GFXpyKV',
      container: 'map',
      style: 'tomtom://vector/1/basic-main',
      center: this.latlng ? [this.latlng.longitude, this.latlng.latitude] : [72.82118, 18.96905],
      zoom: 12,
      dragPan: !isMobile
    });
    this.tomTomMap.addControl(new tt.FullscreenControl());
    this.tomTomMap.addControl(new tt.NavigationControl());
    const ttSearchBox = new SearchBox(services, this.inputSearchOptions);
    this.tomTomMap.addControl(ttSearchBox, 'top-left');
    const abc = this.tomTomMap.addControl(new tt.GeolocateControl({
      positionOptions: {
          enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserLocation: true
   }));
   this.marker = new tt.Marker({
    draggable: true
  }).setLngLat([72.82118, 18.96905]).addTo(this.tomTomMap);
  this.tomTomMap.setCenter([72.82118, 18.96905]);
  this.marker.on('dragend', (event) => {
    if (event && event.target && event.target._lngLat) {
      this.emitLocationDetails(event.target._lngLat.lat, event.target._lngLat.lng);
    }
  });
   this.getLocationDetails();
   ttSearchBox.on('tomtom.searchbox.resultselected', (data) => {
     let lngLat;
     if (data && data.data && data.data.result) {
      lngLat = data.data.result.position && [data.data.result.position.lng, data.data.result.position.lat];
      this.marker.setLngLat(lngLat).addTo(this.tomTomMap);
      this.tomTomMap.setCenter(lngLat);
      this.addressFrmApi = data.data.result.address;
      this.addressFrmApi.latitude = data.data.result.position && data.data.result.position.lat;
      this.addressFrmApi.longitude = data.data.result.position && data.data.result.position.lng;
      this.locationDetails.emit(this.addressFrmApi);
     }
    });
  }

  private getLocationDetails(): void {
    if (this.latlng) {
      this.emitLocationDetails(this.latlng.latitude, this.latlng.longitude);
     } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
          this.emitLocationDetails(position.coords.latitude, position.coords.longitude);
        });
    }
  }

  public getCoordinates(): void {
    let count = 0;
    this.tomTomMap.on('click', (e) => {
      if (count > 0) {
        return;
      }
      count = count + 1;
      this.emitLocationDetails(e.lngLat.lat, e.lngLat.lng);
    })
  }

  private emitLocationDetails(latitude, longitude): void {
    this.coordinates = {
      latitude: this.roundLatLng(latitude),
      longitude: this.roundLatLng(longitude)
    };
    var speedyPizzaCoordinates = [this.coordinates.longitude, this.coordinates.latitude];
    this.marker ? this.marker.setLngLat(speedyPizzaCoordinates).addTo(this.tomTomMap) :
      this.marker = new tt.Marker({
        draggable: true
      }).setLngLat(speedyPizzaCoordinates).addTo(this.tomTomMap);
    this.tomTomMap.setCenter(speedyPizzaCoordinates);
    const latLng: string = this.coordinates.longitude.toString() + ',' + this.coordinates.latitude.toString();
    this.commonService.getLocationDetails(this.coordinates).subscribe((response) => {
      if (response && response.addresses && response.addresses.length > 0) {
        this.addressFrmApi = response.addresses[0].address;
        this.addressFrmApi.latitude = this.coordinates.latitude;
      this.addressFrmApi.longitude = this.coordinates.longitude;
      this.locationDetails.emit(this.addressFrmApi);
      }
    });
  }

  public roundLatLng(num): number {
    return Math.round(num * 1000000) / 1000000;
  }
}
