using Example.Hubs.Clients;
using Example.ViewModel;
using System;
using System.Threading.Tasks;

namespace Example.Hubs
{
    public class ChatHub : AppHubBase<IChatClient> , IHuB
    {
         public ChatHub()
        {
            // this.chatHub = chatHub;

           // Par  t 1: setup the timer for 3 seconds.
            var timer = new System.Timers.Timer(1000);
            // To add the elapsed event handler:
            // ... Type "_timer.Elapsed += " and press tab twice.
            void _timer_Elapsed(object sender, System.Timers.ElapsedEventArgs e)
            {
                    Clients.All.Hello();
            }
            Console.WriteLine("Press \'q\' to quit the sample.");
            timer.Elapsed += new System.Timers.ElapsedEventHandler(_timer_Elapsed);
            timer.Enabled = true;
        }
        public async Task Hello()
        {
            await Clients.All.Hello();
        }

        public async Task<string> StartWorkAsync(StartWorkVm message)
        {
            await Clients.All.StartWorkAsync(message);

            return "Server Response";
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
