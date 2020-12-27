using Example.Hubs.Clients;
using Example.ViewModel;
using System.Threading.Tasks;

namespace Example.Hubs
{
    public class ChatHub : AppHubBase<IChatClient> , IHuB
    {
        public async Task StartWorkAsync(StartWorkVm message)
        {
            await Clients.All.StartWorkAsync(message);
        }
        public async Task StopWork(StopWorkVm message)
        {
            await Clients.All.StopWorkAsync(message);
        }

        public async Task StopWork2(string message)
        {
            await Clients.All.StopWorkAsync(new StopWorkVm());
        }
    }

    public interface IHuB
    {

    }

}
