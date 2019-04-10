import { Component, ViewChild } from '@angular/core';
import { LoadingController } from '@ionic/angular';

import { Api } from '../../api';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [Api]
})
export class HomePage {
  public heroes: any = [];
  public page: number = 0;

  constructor(public api: Api, public loadingController: LoadingController){
    this.loadPeople();
  }

  loadPeople(){
    // this.presentLoading()
    this.api.get('characters', 4, this.page, '')
    .then(result => {
      let { data } = result;
      data.results.forEach((hero) => {
        this.heroes.push({
          image: hero.thumbnail.path + '.' + hero.thumbnail.extension,
          name: hero.name,
          events: hero.events.items.filter((event) => event.name),
          series: hero.series.items.filter((serie) => serie.name)
        })
      });
      // console.log(JSON.parse(this.heroes))
    });
  }
  doInfinite(infiniteScroll) {
    this.page += 1;

    setTimeout(() => {
      this.loadPeople()
      infiniteScroll.target.complete();
    }, 500);
  }
  // async presentLoading() {
  //   const loading = await this.loadingController.create({
  //     message: 'Hellooo',
  //     duration: 2000
  //   });
  //   await loading.present();

  //   const { role, data } = await loading.onDidDismiss();

  //   console.log('Loading dismissed!');
  // }
}
