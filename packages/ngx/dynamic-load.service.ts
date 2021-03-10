// dynamically load a component into the template
import {
  Injectable,
  ComponentFactoryResolver,
  Renderer2,
  RendererFactory2
} from '@angular/core';

@Injectable()
export class DynamicLoadService {
  renderer: Renderer2;
  constructor(
    private resolver: ComponentFactoryResolver,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null); // fix: No provider for Renderer2   https://stackoverflow.com/a/47925259
  }

  /**
   * dynamically load Angular components
   * @method load
   * @param  component [description]
   * @param  ref       reference to the container where the dynamically loaded component will be injected
   * @param  inputs      pass inputs to the component
   * @param fn
   * @return [description]
   */

  /*
  notes:
    - placeholder:
       <ng-template #placeholder></ng-template>  OR <ng-template dynamic-load-directive></>
       @ViewChild('placeholder', {read: ViewContainerRef, static: true}) placeholder: ViewContainerRef;
   */

  load(component: any, placeholder: any, inputs: any) {
    placeholder.clear();

    // todo: provide text or renderer methods
    const content = this.renderer.createText('');

    // resolve the component component and get the factory class to create the component dynamically
    const factory = this.resolver.resolveComponentFactory(component);

    // create the component and append to the placeholder in the template
    const componentRef = placeholder.createComponent(factory);

    if (inputs) {
      const comp = componentRef.instance; // todo: <ComponentType>componentRef.instance
      for (const k in inputs) {
        comp[k] = inputs[k]; // or: Object.assign(..)
      }
    }

    const el = componentRef.location.nativeElement as HTMLElement;
    el.appendChild(content); // or: return el
  }
}
