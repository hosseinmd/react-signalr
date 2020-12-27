using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace Example.Hubs
{
    public abstract class AppHubBase<T> : Hub<T> where T : class
    {

        public async override Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public async override Task OnDisconnectedAsync(Exception exception)
        {

            await base.OnDisconnectedAsync(exception);
        }

    }

}
