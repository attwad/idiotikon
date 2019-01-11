import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

interface lemma {
  lemmaID: number
  url: string
  lemmaText: string
  semEntryCount: number
  meanings: Array<string>
}

interface meaning {
  lemmaID: number
  semDescription: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  lemmalist: Array<lemma>;

  constructor(readonly http: HttpClient) {
    this.lemmalist = [];
  }

  search(query: string) {
    const q = query.trim();
    if (q.length == 0) {
      return;
    }
    this.lemmalist = [];
    this.http.get(environment.apiPath + 'lemmalist?query=' + encodeURI(q))
      .subscribe((data : Array<lemma>) => {
        // Filter entries without associated meanings.
        data = data.filter(function(element: lemma, index, array) {
          return element.semEntryCount > 0;
        });
        // Query meanings for each lemma.
        data.forEach((lemma: lemma) => {
          lemma.meanings = [];
          this.http.get(environment.apiPath + 'meaninglist?lemma_id=' + lemma.lemmaID)
          .subscribe((meanings: Array<meaning>) => {
            meanings.forEach((meaning: meaning) => {
              lemma.meanings.push(meaning.semDescription);
            });
          });
        });
        this.lemmalist = data;
      })
  }
}
