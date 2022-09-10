import { Component, OnInit } from '@angular/core';
import { Edge, Node } from '@swimlane/ngx-graph';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  editorOptions = { theme: 'vs-dark', language: 'json' };
  code: string = '{}';
  sample = null;

  nodes: Node[] = [];

  edges: Edge[] = [];

  layout: string = 'dagreCluster';

  // line interpolation
  curveType: string = 'Bundle';
  curve: any = shape.curveBundle.beta(1);

  draggingEnabled: boolean = false;
  panningEnabled: boolean = true;
  zoomEnabled: boolean = true;

  zoomSpeed: number = 0.1;
  minZoomLevel: number = 0.1;
  maxZoomLevel: number = 4.0;
  panOnZoom: boolean = true;

  autoZoom: boolean = false;
  autoCenter: boolean = false;

  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();
  zoomToFit$: Subject<boolean> = new Subject();

  ngOnInit() {
  }



  formStructure(json: object, source: string) {
    let isPrimitive = typeof json;
    if (isPrimitive == 'string' || isPrimitive == 'number' || isPrimitive == 'boolean') {
      return;
    }
    let isArray = Array.isArray(json);
    if (isArray) {
      Object.keys(json).forEach(k => {
        this.formStructure(json[k as keyof object], `${source}-${k}`);
      })
    }
    else {
      let keyArr = Object.keys(json);
      let rootObj: object = {};
      for (let key of keyArr) {
        if (typeof json[key as keyof object] != 'object') {
          rootObj[key as keyof object] = json[key as keyof object];
        }
        else {
          if (Array.isArray(json[key as keyof object])) {

            this.nodes.push({ id: `${key}`, label: key });
            this.edges.push({ id: `e-${source}-${key}`, source: `${source}`, target: `${key}` });
            this.formStructure(json[key as keyof object], `${key}`);
          }
          else
            this.formStructure(json[key as keyof object], `${source}-${key}`);
        }
      }
      let plainObj = { id: source, label: JSON.stringify(rootObj) }
      let srcArray = source.split('-');
      let srcLength = source.split('-').length;
      this.nodes.push(plainObj);
      if (srcLength <= 2) {
        if (srcArray[0] != source) {
          let edge = { id: `e-${source}-0`, source: `${srcArray[0]}`, target: `${source}`, label: `${srcArray[1]}` }
          this.edges.push(edge);
        }
      }
      else {
        for (let i = 0; i < srcLength; i++) {
          let x = source.lastIndexOf("-");
          let y = source.substring(0, x);
          let z = source.substring(x + 1);
          let m = source.indexOf("-");

          let edge = { id: `e-${source}-${i}`, source: `${y}`, target: `${source}`, label: `${z}` }
          let found = false;
          for (let i = 0; i < this.edges.length; i++) {
            if (edge.source == this.edges[i].source && edge.target == this.edges[i].target) {
              found = true;
              break;
            }
          }
          if (!found) {
            this.edges.push(edge);
          }
        }
      }

    }
  }
  public getStyles(node: Node): any {
    return {
      'background-color': node.data.backgroundColor
    };
  }
  jsonChanged(value: any) {
    this.code = value;
    try {
      this.nodes = [];
      this.edges = [];
      this.formStructure(JSON.parse(this.code), "root");
      console.log(this.nodes);
      console.log(this.edges);
    }
    catch (e) {
      console.error(e);
    }
  }
  showData(data: any) {
    alert(data);
  }
}
