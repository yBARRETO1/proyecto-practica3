import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Register } from './pages/register/register';
import { Generadores } from './pages/generadores/generadores';
import { Recolectores } from './pages/recolectores/recolectores';
import { Disposicion } from './pages/disposicion/disposicion';

export const routes: Routes = [

{
path:"",
component:Login
},

{
path:"dashboard",
component:Dashboard
},
{
path:"register",
component:Register
},
{
path:"generadores",
component:Generadores
},

{
path:"recolectores",
component:Recolectores
},

{
path:"disposicion",
component:Disposicion
}

];