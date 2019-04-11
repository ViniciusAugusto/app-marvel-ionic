import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../../api';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  providers: [Api]
})
export class DetailsPage implements OnInit {
  public id: string;
  public character: any = {
    name: '',
    image: '',
    description: '',
    seriesData: [],
    eventsData: []
  };

  constructor(private route: ActivatedRoute, public api: Api) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadCharacter(this.id)
  }

  loadCharacter (id:string) {
    this.api.get(`characters/${id}`, 1, 1, '').then((result:any) => {
      if (result.code === 200) {
        let { count, limit, offset, results, total }:any = result.data;
        this.character = {
          image: results[0].thumbnail.path + '.' + results[0].thumbnail.extension,
          seriesData: [],
          eventsData: [],
          ...results[0]
        }
        this.loadDetailsSeries(this.character.series.items, id)
        this.loadDetailsEvents(this.character.events.items, id)
        console.log(this.character)
      }
    })
  }

  async loadDetailsSeries (series, id) {
    const seriesPromises = series.map(serie => {
      return  this.api.get(serie.resourceURI.replace('http://gateway.marvel.com/v1/public/', ''), 100, 0, '')
    })
    series = await Promise.all(seriesPromises)
    series.forEach(serie => {
      if (serie.code === 200) {
        let { results }:any = serie.data;
        this.character.seriesData.push({
          ...results[0],
          image: results[0].thumbnail.path + '.' + results[0].thumbnail.extension,
        })
      }
    })
  }

  async loadDetailsEvents (events, id) {
    const eventsPromises = events.map(event => {
      return  this.api.get(event.resourceURI.replace('http://gateway.marvel.com/v1/public/', ''), 100, 0,'')
    })
    events = await Promise.all(eventsPromises)
    events.forEach(event => {
      if (event.code === 200) {
        let { results }:any = event.data;
        this.character.eventsData.push({
          ...results[0],
          image: results[0].thumbnail.path + '.' + results[0].thumbnail.extension,
        })
      }
    })
  }

}
