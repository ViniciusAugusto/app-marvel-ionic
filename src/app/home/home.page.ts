import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Api } from '../../api';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [Api]
})
export class HomePage {
  public heroes: any = [];
  public total: number = 0;
  public pageList: any = []
  public list: any = []
  public count: number = 0
  public currentPage: number = 1
  public numberPerPage:number = 4
  public numberOfPages:number = 0
  public next:boolean = false
  public previous:boolean = false
  public first:boolean = false
  public last:boolean = false
  public loading: string = 'Carregando dados - 0%'
  public name:string = ''
  public author = 'Vinicius Augusto Cunha'
  constructor(public api: Api, public loadingController: LoadingController, private router: Router){
    this.preLoad()
  }

  preLoad () {
    if (!localStorage.getItem('characters')) {
      this.load([], 0, (characters) => {
        this.heroes = characters
        localStorage.setItem('characters', JSON.stringify(characters))
        setTimeout(() => {
          this.makeList()
          this.loadList()
        }, 300)
      })
    } else {
      this.heroes = JSON.parse(localStorage.getItem('characters'))
      setTimeout(() => {
        this.makeList()
        this.loadList()
      }, 300)
    }
  }


  load (characters, count, cb) {
    this.api.get('characters', 100, count, '').then((result:any) => {
      if (result.code === 200) {
        let { count, limit, offset, results, total }:any = result.data;
        this.total = total
        this.count = count + 100
        const arrMap = results.map((char) => {
          return {
            id: char.id,
            image: char.thumbnail.path + '.' + char.thumbnail.extension,
            name: char.name,
            events: char.events.items.filter((event) => event.name),
            series: char.series.items.filter((serie) => serie.name)
          }
        })

        characters = characters.concat(arrMap)
        let percent = +parseInt(`${((characters.length / this.total) * 100)}`)
        this.loading = `Carregando dados - ${percent}%`
        if(characters.length >= this.total) {
          cb(characters)
        } else {
          this.load(characters, this.count, cb)
        }
      }
    })
  }


  makeHtmlList () {
    const arrayHtml = [];
    for (let index = 0; index < this.heroes.length; index++) {
      arrayHtml.push(`
      <tr data-ref="${index}">
        <td>
          <ion-avatar style="float:left">
            <img src="${this.heroes[index].image}" alt="${this.heroes[index].name.trim()}">
          </ion-avatar>
          <span><ion-button fill="clear" color="danger" href="/details/${this.heroes[index].id}">${this.heroes[index].name.trim()}</ion-button></span>
        </td>
        <td class="mobile">
          ${this.heroes[index].series.map(serie => `${serie.name}<br />`).join('')}
        </td>
        <td class="mobile">
          ${this.heroes[index].events.map(event => `${event.name}<br />`).join('')}
        </td>
      </tr>`)
    }
    return arrayHtml
  }

  makeList() {
    const allArrayHtmlList = this.makeHtmlList()
    for (var x = 0; x < this.heroes.length; x++){
      this.list.push(allArrayHtmlList[x]);
    }
    this.numberOfPages = this.getNumberOfPages();
  }

  getNumberOfPages() {
      return Math.ceil(this.list.length / this.numberPerPage);
  }

  nextPage() {
      this.currentPage += 1;
      this.loadList();
  }

  previousPage() {
      this.currentPage -= 1;
      this.loadList();
  }

  firstPage() {
      this.currentPage = 1
      this.loadList()
  }

  lastPage() {
      this.currentPage = this.numberOfPages;
      this.loadList();
  }

  loadList() {
      var begin = ((this.currentPage - 1) * this.numberPerPage)
      var end = begin + this.numberPerPage
      this.pageList = this.list.slice(begin, end)
      this.drawList();
      this.check();
  }

  drawList() {
    document.getElementById("list").innerHTML = ''
    setTimeout(() => {
      for (var r = 0; r < this.pageList.length; r++) {
        document.getElementById("list").innerHTML += this.pageList[r]
      }
    }, 100)

    let numbers = ''
    for (let index = this.currentPage; index < (this.currentPage + 5); index++) {
      if (index === (this.heroes.length / this.numberPerPage)) break;
      numbers += (index === this.currentPage) ? `<li class="active">${index}</li>` : `<li>${index}</li>`
    }
    document.getElementById('numbers').innerHTML = numbers
  }

  check() {
    this.next = this.currentPage == this.numberOfPages ? true : false
    this.previous = this.currentPage == 1 ? true : false
    this.first = this.currentPage == 1 ? true : false
    this.last = this.currentPage == this.numberOfPages ? true : false
  }

  findHeroes () {
    if (this.name != '') {
      this.api.get('characters', 100, 0, this.name).then((data:any) => {
        if (data.code === 200) {
          const arrMap = data.data.results.map((char) => {
              return {
                id: char.id,
                image: char.thumbnail.path + '.' + char.thumbnail.extension,
                name: char.name,
                events: char.events.items.filter((event) => event.name),
                series: char.series.items.filter((serie) => serie.name)
              }
          })
          this.resetHeroes(arrMap)
        }
      })
    } else {
      this.resetHeroes(JSON.parse(localStorage.getItem('characters')))
    }
  }

  resetHeroes (heroes) {
    this.heroes = heroes
    this.pageList = []
    this.list = []
    this.currentPage = 1
    this.numberPerPage = 3
    this.numberOfPages = 0
    this.makeList()
    this.loadList()
  }

  go (id) {
    this.router.navigateByUrl(`/details/${id}`);
  }
}
