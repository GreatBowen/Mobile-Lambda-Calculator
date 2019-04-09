import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: '../home/home.module#HomePageModule'
          }
        ]
      },
      {
        path: 'communicate',
        children: [
          {
            path: '',
            loadChildren: '../communicate/communicate.module#CommunicatePageModule'
          }
        ]
      },
      {
        path: 'calculator',
        children: [
          {
            path: '',
            loadChildren: '../calculator/calculator.module#CalculatorPageModule'
          }
        ]
      },
      {
        path: 'about-us',
        children: [
          {
            path: '',
            loadChildren: '../about-us/about-us.module#AboutUsPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
