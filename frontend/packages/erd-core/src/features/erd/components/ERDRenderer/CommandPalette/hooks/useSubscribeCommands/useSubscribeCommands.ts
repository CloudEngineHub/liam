import { useSubscribeCopyLinkCommand } from './useSubscribeCopyLinkCommand'
import { useSubscribeShowModeCommand } from './useSubscribeSwitchShowMode'
import { useSubscribeTidyUpCommand } from './useSubscribeTidyUpCommand'
import { useSubscribeZoomToFitCommand } from './useSubscribeZoomToFitCommand'

export const useSubscribeCommands = () => {
  useSubscribeCopyLinkCommand()
  useSubscribeShowModeCommand()
  useSubscribeTidyUpCommand()
  useSubscribeZoomToFitCommand()
}
